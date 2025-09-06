import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.scss']
})
export class ExpenseModalComponent {
  expenseForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.expenseForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      merchant: ['', [Validators.required, Validators.minLength(2)]],
      currency: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      this.modalController.dismiss({
        expense: this.expenseForm.value
      });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
