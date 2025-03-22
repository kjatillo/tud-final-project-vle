namespace VleProjectApi.Dtos;

public class PaymentRequestDto
{
    public string ModuleName { get; set; } = string.Empty;
    public long Amount { get; set; }
    public string SuccessUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
}
