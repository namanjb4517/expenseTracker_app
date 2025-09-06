import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Auth } from 'src/app/core/services/auth';
import { ModalController } from '@ionic/angular';
import { ExpenseModalComponent } from '../../shared/expense-modal/expense-modal.component';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  recentSpends: any[] = [];
  amountLimit: number = 10000;
  usedLimit: any = null;
  usedPercentage: number = 0;
  status: string = 'Good';
  constructor(private authService: Auth, private router: Router, private modalController: ModalController) { }

  ngOnInit() {
    setInterval(async () => {
      let storedRefreshToken = await Preferences.get({
        key: 'refreshToken'
      });
      this.authService.verifyToken(storedRefreshToken.value).subscribe({
        next: async (res) => {
          await Preferences.set({
            key: 'refreshToken',
            value: res.token,
          });
          await Preferences.set({
            key: 'accessToken',
            value: res.accessToken,
          });
        },
        error: (err) => {
          console.error('Token verification failed:', err);
          this.router.navigate(['/auth/signin']);
        }
      });
    }, 1000 * 40);
    setTimeout(() => {
      this.loadRecentSpends();
    }, 1000);
  }

  async loadRecentSpends() {
    let storedAccessToken = await Preferences.get({
      key: 'accessToken'
    });
    this.authService.getRecentSpends(storedAccessToken.value).subscribe({
      next: (res) => {
        this.recentSpends = res;
        for (let spend of this.recentSpends) {
          this.usedLimit += spend.amount;
        }
        // upto two decimal places
        this.usedPercentage = ((this.usedLimit / this.amountLimit) * 100).toFixed(2) as unknown as number;
        if (this.usedPercentage > 100) {
          this.usedPercentage = 100;
        }
        if (this.usedPercentage > 80) {
          this.status = 'Critical';
        } else if (this.usedPercentage > 50) {
          this.status = 'Warning';
        } else {
          this.status = 'Good';
        }
      },
      error: (err) => {
        console.error('Error fetching recent spends:', err);
      }
    });
  }

  async addExpense() {
    const modal = await this.modalController.create({
      component: ExpenseModalComponent,
      cssClass: 'expense-modal'
    });
    
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data && data.expense) {
      console.log('New expense:', data.expense);
      // Here you can add the logic to save the expense
      // For example, call a service method to save the expense
      let storedAccessToken = await Preferences.get({
        key: 'accessToken'
      });
      this.authService.addExpense(data.expense,storedAccessToken.value).subscribe({
        next: (res) => {
          this.loadRecentSpends();
          console.log('Expense added:', res);
        },
        error: (err) => {
          console.error('Error adding expense:', err);
        }
      })
    }
  }

  async logout() {
    await Preferences.remove({ key: 'accessToken' });
    await Preferences.remove({ key: 'refreshToken' });
    this.router.navigate(['/auth/signin']);
  }
}
