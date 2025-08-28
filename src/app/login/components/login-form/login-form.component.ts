import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { Auth } from 'src/app/core/services/auth';

import { Preferences } from '@capacitor/preferences';
import { LoadingController, LoadingOptions } from '@ionic/angular';

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
  constructor(private fb: FormBuilder, private router: Router, private authService: Auth,private loadingCtrl:LoadingController) { }

  ngOnInit() {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.checkIfLoggedIn();
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

    let storedRefreshTokenawait = await Preferences.get({
          key: 'refreshToken'
        });

    this.authService.verifyToken(storedRefreshTokenawait.value).subscribe({
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
        // navigate to dashboard or home page
        this.loadingCtrl.dismiss();
        this.router.navigate(['/journey/home']);
      },
      error: (err) => {
        this.loadingCtrl.dismiss();
        console.error('Login failed:', err);
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  redirectToSignUp(): void {
    // Logic to navigate to the signup page
    this.router.navigate(['/auth/signup']);
  }

}
