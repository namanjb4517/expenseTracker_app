import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Auth } from 'src/app/core/services/auth';
import { AlertController, ModalController } from '@ionic/angular';
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
  constructor(private authService: Auth, private router: Router, private modalController: ModalController,private alertController:AlertController) { }

  async ngOnInit() {
    console.log('HomeComponent ngOnInit called');
    this.loadRecentSpends();
    
    // Set up token refresh interval
    setInterval(async () => {
      let storedRefreshToken = await Preferences.get({
        key: 'refreshToken'
      });
      
      if (storedRefreshToken.value) {
        this.authService.verifyToken(storedRefreshToken.value).subscribe({
          next: async (res) => {
            console.log('Token refreshed successfully');
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
      }
    }, 1000 * 40);
  }

  async loadRecentSpends() {
    console.log('loadRecentSpends called');
    
    let storedAccessToken = await Preferences.get({
      key: 'accessToken'
    });
    
    console.log('Access token retrieved:', storedAccessToken.value ? 'Token exists' : 'No token');
    
    if (!storedAccessToken.value) {
      console.error('No access token available');
      let errorMessage = 'No access token available. Please login again.';
      const alert = await this.alertController.create({
        header: 'Authentication Error',
        message: errorMessage,
        buttons: ['OK'],
        cssClass: 'error-alert'
      });
      await alert.present();
      this.router.navigate(['/auth/signin']);
      return;
    }
    
    console.log('Making API call to getRecentSpends');
    this.authService.getRecentSpends(storedAccessToken.value).subscribe({
      next: (res) => {
        console.log('API response received:', res);
        this.recentSpends = res;
        this.usedLimit = 0; // Reset used limit
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
        let errorMessage = 'Failed to fetch recent spends. Please try again.';
        this.alertController.create({
          header: 'Error',
          message: errorMessage,
          buttons: ['OK'],
          cssClass: 'error-alert'
        }).then(alert => alert.present());
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
