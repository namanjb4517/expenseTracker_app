import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Route, Router } from '@angular/router';
import { Auth } from 'src/app/core/services/auth';

import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController, LoadingOptions } from '@ionic/angular';
import { filter } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  signInForm!: FormGroup;
  submitted = false;
  errorMessage: string = '';
  constructor(private fb: FormBuilder, private router: Router, private authService: Auth, private loadingCtrl: LoadingController, private alertController: AlertController) { }

  ngOnInit() {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.checkIfLoggedIn();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/auth/signin') || event.url.endsWith('/signin')) {
          console.log('Navigated to signin - resetting form');
          this.signInForm.reset();
          this.submitted = false;
          this.errorMessage = '';
        }
      });

  }



  // convenience getter for easy access to form fields
  get f() {
    return this.signInForm.controls;
  }

  async checkIfLoggedIn() {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',   // options: 'bubbles' | 'circles' | 'dots' | 'crescent' | 'lines'
    });
    await loader.present();
    let storedAccessToken = await Preferences.get({
      key: 'accessToken'
    });
    let storedRefreshTokenawait = await Preferences.get({
      key: 'refreshToken'
    });
    if (storedAccessToken.value != null) {
      this.authService.isuserAuthenticated(storedAccessToken.value).subscribe({
        next: (res) => {
          loader.dismiss();
          this.router.navigate(['/journey/home']);
        },
        error: (err) => {
          loader.dismiss();
          console.error('Access token invalid:', err);
          this.refreshToken(storedRefreshTokenawait.value);
        }
      });
    } else {
      loader.dismiss();
    }
  }

  async refreshToken(refreshToken: string | null) {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',   // options: 'bubbles' | 'circles' | 'dots' | 'crescent' | 'lines'
    });
    await loader.present();
    this.authService.verifyToken(refreshToken).subscribe({
      next: async (res) => {
        await Preferences.set({
          key: 'refreshToken',
          value: res.token,
        });
        await Preferences.set({
          key: 'accessToken',
          value: res.accessToken,
        });
        loader.dismiss();
        this.router.navigate(['/journey/home']);
      },
      error: (err) => {
        loader.dismiss();
        console.error('Token verification failed:', err);
      }
    });
  }

  async onSubmit(): Promise<void> {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',   // options: 'bubbles' | 'circles' | 'dots' | 'crescent' | 'lines'
    });
    await loader.present();
    this.submitted = true;

    if (this.signInForm.invalid) {
      this.loadingCtrl.dismiss();
      return;
    }

    console.log('Form Submitted:', this.signInForm.value);
    // Call your auth service here...

    this.authService.login(this.signInForm.value).subscribe({
      next: async (res) => {
        console.log('Login success:', res);
        // save token to localStorage
        // localStorage.setItem('token', res.token);
        await Preferences.set({
          key: 'refreshToken',
          value: res.token,
        });
        await Preferences.set({
          key: 'accessToken',
          value: res.accessToken,
        });
        
        console.log('Tokens stored successfully');
        // navigate to dashboard or home page
        this.loadingCtrl.dismiss();
        
        // Add a small delay to ensure tokens are properly stored
        setTimeout(() => {
          this.router.navigate(['/journey/home']);
        }, 100);
      },
      error: async (err) => {
        this.loadingCtrl.dismiss();
        console.error('Login failed:', err);
        this.errorMessage = 'Invalid username or password';
        const alert = await this.alertController.create({
          header: 'Error',
          message: this.errorMessage,
          buttons: ['OK'],
          cssClass: 'error-alert'
        });
        await alert.present();
      }
    });
  }

  redirectToSignUp(): void {
    // Logic to navigate to the signup page
    this.router.navigate(['/auth/signup']);
  }

}
