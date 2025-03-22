using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using VleProjectApi.Dtos;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public PaymentController(
        IConfiguration configuration,
        IEnrolmentRepository enrolmentRepository,
        UserManager<ApplicationUser> userManager)
    {
        _configuration = configuration;
        _enrolmentRepository = enrolmentRepository ?? throw new ArgumentNullException(nameof(enrolmentRepository));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Creates a Stripe Checkout session for the payment of a module.
    /// </summary>
    /// <param name="paymentRequest">The payment request details including module name, amount, success URL, and cancel URL.</param>
    /// <returns>Returns an Ok result with the session ID if successful, otherwise returns Unauthorized if the user is not authenticated.</returns>
    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] PaymentRequestDto paymentRequest)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = paymentRequest.Amount,  // Amount converted to cents in frontend
                        Currency = "eur",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = paymentRequest.ModuleName,
                        },
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = $"{paymentRequest.SuccessUrl}?id={paymentRequest.ModuleId}",
            CancelUrl = paymentRequest.CancelUrl,
            Metadata = new Dictionary<string, string>
            {
                { "moduleId", paymentRequest.ModuleId.ToString() },
                { "userId", user.Id }
            }
        };

        var service = new SessionService();
        Session session = service.Create(options);

        return Ok(new { sessionId = session.Id });
    }

    /// <summary>
    /// Handles Stripe webhook events.
    /// </summary>
    /// <returns>Returns an Ok result if the event is processed successfully, otherwise returns BadRequest.</returns>
    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        Event stripeEvent;

        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _configuration["Stripe:WebhookSecret"]
            );
        }
        catch (StripeException)
        {
            return BadRequest();
        }
        catch (Exception)
        {
            return BadRequest();
        }

        if (stripeEvent.Type == "checkout.session.completed")
        {
            var session = stripeEvent.Data.Object as Session;

            if (session?.Metadata != null &&
                session.Metadata.ContainsKey("moduleId") &&
                session.Metadata.ContainsKey("userId"))
            {
                var moduleId = Guid.Parse(session.Metadata["moduleId"]);
                var userId = session.Metadata["userId"];

                await _enrolmentRepository.EnrolUserInModuleAsync(userId, moduleId);
            }
        }

        return Ok();
    }
}
