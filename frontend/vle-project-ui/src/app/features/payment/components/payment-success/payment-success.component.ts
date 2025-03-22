import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  moduleId!: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.queryParamMap.get('id')!;

    setTimeout(() => {
      if (this.moduleId) {
        this.router.navigate([`/module/${this.moduleId}`]);
      } else {
        this.router.navigate(['/explore']);
      }
    }, 3000); // Redirect after 3 seconds
  }
}