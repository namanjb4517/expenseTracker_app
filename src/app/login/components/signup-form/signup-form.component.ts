import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { filter } from 'rxjs';
import { Auth } from 'src/app/core/services/auth';

@Component({
  standalone:false,
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent  implements OnInit {
  errorMessage: string = '';
  signUpForm!:FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private router:Router, private authService:Auth,private loadingCtrl: LoadingController, private alertController: AlertController) { }

  ngOnInit() {
    this.signUpForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(3)]],
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/auth/signin') || event.url.endsWith('/signin')) {
          console.log('Navigated to signin - resetting form');
          this.signUpForm.reset();
          this.submitted = false;
          this.errorMessage = '';
        }
      });
    
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.signUpForm.controls;
  }

  async onSubmit(): Promise<void> {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',   // options: 'bubbles' | 'circles' | 'dots' | 'crescent' | 'lines'
    });
    await loader.present();
    this.submitted = true;

    if (this.signUpForm.invalid) {
      this.loadingCtrl.dismiss();
      return;
    }

    console.log('Form Submitted:', this.signUpForm.value);
    // Call your auth service here...

    this.authService.signup(this.signUpForm.value).subscribe({
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
        loader.dismiss();
        this.router.navigate(['/journey/home']);
      },
      error: async (err) => {
        loader.dismiss();
        console.error('Login failed:', err);
        this.errorMessage = 'Invalid data provided';
        this.errorMessage = 'Not able to signup. Please try again later.';
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

  redirectToSignIn(): void {
    // Logic to navigate to the signup page
    this.router.navigate(['/auth/signin']);
  }

}
