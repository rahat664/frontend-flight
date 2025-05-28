import {Component, HostListener, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {login, loginUsingPhoneNumber} from "../../store/auth.action";
import {interval, Subscription} from "rxjs";
import {select, Store} from "@ngrx/store";
import {selectAuthError, selectAuthLoading} from "../../store/auth.selectors";
import {AuthState} from "../../store/auth.reducer";
import {AuthService} from "../../services/auth.service";
import {LoginPhoneRequest, LoginRequest, LoginRequestUsingPhone} from "../../models/request/login-request.model";
import {CommonModule} from "@angular/common";
import {MatFormField, MatInput} from "@angular/material/input";
import {NgxMaterialIntlTelInputComponent, CountryISO} from "ngx-material-intl-tel-input";

@Component({
  selector: 'sign-in',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormField,
    NgxMaterialIntlTelInputComponent,
    MatInput
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  @ViewChildren('numberInput') phoneInput: any;
  title = 'Login';
  loginForm: FormGroup;
  loginRequestPayload: LoginRequest;
  usingEmail = true;

  loginUsingPhonePayload: LoginPhoneRequest;
  loginPhoneRequestPayload: LoginRequestUsingPhone;
  otpScreen = false;
  idName = 'otp1';
  time: Date = new Date(0, 0, 0, 0, 2, 0); // 2 minutes
  private countdownSubscription: Subscription | undefined;
  private errorSubscription: Subscription | undefined;
  private loadingSubscription: Subscription | undefined;
  timeDisabled: boolean;
  error: string | null = null; // Add error property
  $loading: boolean;

  constructor(
      private auth: AuthService,
      private store: Store<{ auth: AuthState }>,
      private fb: FormBuilder,
  ) {
    this.loginRequestPayload = { email: '', password: '' };
    this.loginUsingPhonePayload = { phoneNumber: '' };
    this.loginPhoneRequestPayload = { phoneNumber: '', otpCode: '' };
  }

  ngOnInit(): void {
    this.createFormControls();
    this.errorSubscription = this.store
        .pipe(select(selectAuthError))
        .subscribe(error => {
          if (error) {
            alert(error.error?.message);
            this.loginRequestPayload = {
              email: '',
              password: '',
            };
            this.loginPhoneRequestPayload = {
              phoneNumber: '',
              otpCode: '',
            };
          }
        });
    this.loadingSubscription = this.store
        .pipe(select(selectAuthLoading))
        .subscribe(loading => {
          this.$loading = loading;
        });
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
      this.error = null;
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
      this.$loading = false;
    }
  }

  createFormControls() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: [''],
      otp1: [''],
      otp2: [''],
      otp3: [''],
      otp4: [''],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get phoneNumber() {
    return this.loginForm.get('phoneNumber');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      if (this.usingEmail) {
        this.loginRequestPayload.email = this.email.value;
        this.loginRequestPayload.password = this.password.value;
        this.store.dispatch(login({ payload: this.loginRequestPayload }));
      } else {
        this.$loading = true;
        this.loginUsingPhonePayload.phoneNumber = this.phoneNumber.value;
        // delete the space and - from the phone number
        this.loginUsingPhonePayload.phoneNumber =
            this.loginUsingPhonePayload.phoneNumber.replace(/[-\s]/g, '');
        this.auth.loginUsingPhone(this.loginUsingPhonePayload).subscribe(
            response => {
              this.$loading = false;
              if (response.status === 'OK') {
                this.otpScreen = true;
                this.setupOtpValidators();
                this.startCountdown();
              } else {
               alert(response.message);
              }
            },
            error => {
              this.$loading = false;
              alert(error.error.message);
            }
        );
      }
    } else {
      this.$loading = false;
      this.loginForm.markAllAsTouched();
    }
  }

  private setupOtpValidators() {
    this.loginForm.get('otp1').setValidators([Validators.required]);
    this.loginForm.get('otp2').setValidators([Validators.required]);
    this.loginForm.get('otp3').setValidators([Validators.required]);
    this.loginForm.get('otp4').setValidators([Validators.required]);
    this.loginForm.get('otp1').updateValueAndValidity();
    this.loginForm.get('otp2').updateValueAndValidity();
    this.loginForm.get('otp3').updateValueAndValidity();
    this.loginForm.get('otp4').updateValueAndValidity();
    this.idName = 'otp1';
    this.monitorOtpFields();
  }

  private monitorOtpFields() {
    this.loginForm.get('otp1').valueChanges.subscribe(value => {
      // should not take input if the value is not a number
      if (isNaN(Number(value))) {
        this.loginForm.get('otp1').setValue('');
      } else {
        if (value?.length === 1) this.idName = 'otp2';
      }
    });
    this.loginForm.get('otp2').valueChanges.subscribe(value => {
      if (isNaN(Number(value))) {
        this.loginForm.get('otp2').setValue('');
      } else {
        if (value?.length === 1) this.idName = 'otp3';
      }
    });
    this.loginForm.get('otp3').valueChanges.subscribe(value => {
      if (isNaN(Number(value))) {
        this.loginForm.get('otp3').setValue('');
      } else {
        if (value?.length === 1) this.idName = 'otp4';
      }
    });
    this.loginForm.get('otp4').valueChanges.subscribe(value => {
      if (isNaN(Number(value))) {
        this.loginForm.get('otp4').setValue('');
      }
    });
  }

  private startCountdown() {
    const source = interval(1000); // Emit every second
    this.countdownSubscription = source.subscribe(() => {
      if (this.time.getMinutes() === 0 && this.time.getSeconds() === 0) {
        this.countdownSubscription?.unsubscribe();
        this.timeDisabled = true;
      } else {
        this.decreaseTime();
      }
    });
  }

  private decreaseTime() {
    const seconds = this.time.getSeconds();
    const minutes = this.time.getMinutes();

    if (seconds > 0) {
      this.time = new Date(0, 0, 0, 0, minutes, seconds - 1);
    } else if (minutes > 0) {
      this.time = new Date(0, 0, 0, 0, minutes - 1, 59);
    }
  }

  togglePassword() {
    const password = document.getElementById('password');
    const icon = document.getElementById('icon');
    if (password.getAttribute('type') === 'password') {
      password.setAttribute('type', 'text');
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      password.setAttribute('type', 'password');
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  }

  getEmailError() {
    if (this.email.hasError('required')) {
      return 'Enter your email address';
    } else if (this.email.hasError('minlength')) {
      return 'Invalid email';
    } else if (this.email.hasError('pattern')) {
      return 'Invalid email';
    } else if (this.email.hasError('email')) {
      return 'Invalid email';
    } else {
      return '';
    }
  }

  getPasswordError() {
    if (this.password.hasError('required')) {
      return 'Enter your password';
    } else if (this.password.hasError('minlength')) {
      return 'Invalid password';
    } else {
      return '';
    }
  }

  onClickUseMobileNumber() {
    this.loginForm.get('email').clearValidators();
    this.loginForm.get('email').updateValueAndValidity();
    this.loginForm.get('email').setValue('');
    this.loginForm.get('password').setValue('');
    this.loginForm.get('password').clearValidators();
    this.loginForm.get('password').updateValueAndValidity();
    this.usingEmail = false;
    this.loginForm.get('phoneNumber').setValidators([Validators.required]);
    this.loginForm.get('phoneNumber').updateValueAndValidity();
    this.loginForm.get('otp1').clearValidators();
    this.loginForm.get('otp2').clearValidators();
    this.loginForm.get('otp3').clearValidators();
    this.loginForm.get('otp4').clearValidators();
    this.loginForm.get('otp1').updateValueAndValidity();
    this.loginForm.get('otp2').updateValueAndValidity();
    this.loginForm.get('otp3').updateValueAndValidity();
    this.loginForm.get('otp4').updateValueAndValidity();
  }

  onClickUseEmail() {
    this.loginForm.get('phoneNumber').clearValidators();
    this.loginForm.get('phoneNumber').updateValueAndValidity();
    this.loginForm.get('phoneNumber').setValue('');
    this.loginForm.get('otp1').clearValidators();
    this.loginForm.get('otp2').clearValidators();
    this.loginForm.get('otp3').clearValidators();
    this.loginForm.get('otp4').clearValidators();
    this.loginForm.get('otp1').updateValueAndValidity();
    this.loginForm.get('otp2').updateValueAndValidity();
    this.loginForm.get('otp3').updateValueAndValidity();
    this.loginForm.get('otp4').updateValueAndValidity();
    this.usingEmail = true;
    this.loginForm
        .get('email')
        .setValidators([Validators.required, Validators.email]);
    this.loginForm.get('email').updateValueAndValidity();
    this.loginForm
        .get('password')
        .setValidators([Validators.required, Validators.minLength(3)]);
    this.loginForm.get('password').updateValueAndValidity();
  }

  onOtpLogin() {
    this.loginPhoneRequestPayload.phoneNumber = this.phoneNumber.value;
    // delete the space and - from the phone number
    this.loginPhoneRequestPayload.phoneNumber =
        this.loginPhoneRequestPayload.phoneNumber.replace(/[-\s]/g, '');
    this.loginPhoneRequestPayload.otpCode = `${this.loginForm.get('otp1').value}${this.loginForm.get('otp2').value}${this.loginForm.get('otp3').value}${this.loginForm.get('otp4').value}`;
    this.store.dispatch(
        loginUsingPhoneNumber({ payload: this.loginPhoneRequestPayload })
    );
  }

  onClickResend() {
    this.loginForm.get('otp1').setValue('');
    this.loginForm.get('otp2').setValue('');
    this.loginForm.get('otp3').setValue('');
    this.loginForm.get('otp4').setValue('');
    this.loginForm.get('otp1').clearValidators();
    this.loginForm.get('otp2').clearValidators();
    this.loginForm.get('otp3').clearValidators();
    this.loginForm.get('otp4').clearValidators();
    this.loginForm.get('otp1').updateValueAndValidity();
    this.loginForm.get('otp2').updateValueAndValidity();
    this.loginForm.get('otp3').updateValueAndValidity();
    this.loginForm.get('otp4').updateValueAndValidity();
    this.$loading = false;
    this.auth.loginUsingPhone(this.loginUsingPhonePayload).subscribe(
        response => {
          if (response.status === 'OK') {
            alert('OTP sent successfully');
            this.countdownSubscription?.unsubscribe();
            this.time = new Date(0, 0, 0, 0, 2, 0);
            this.timeDisabled = false;
            this.startCountdown();
          } else {
            alert(response.message);
          }
        },
        error => {
          alert(error.error.message);
        }
    );
  }

  // backspace event handler on a window
  @HostListener('window:keydown', ['$event']) handleKeyDown(
      event: KeyboardEvent
  ) {
    if (event.key === 'Backspace') {
      if (this.idName === 'otp4') {
        if (this.loginForm.get('otp4').value === '') {
          this.idName = 'otp3';
          this.loginForm.get('otp3').setValue('');
        } else {
          this.loginForm.get('otp4').setValue('');
        }
      } else if (this.idName === 'otp3') {
        if (this.loginForm.get('otp3').value === '') {
          this.idName = 'otp2';
          this.loginForm.get('otp2').setValue('');
        } else {
          this.loginForm.get('otp3').setValue('');
        }
      } else if (this.idName === 'otp2') {
        if (this.loginForm.get('otp2').value === '') {
          this.idName = 'otp1';
          this.loginForm.get('otp1').setValue('');
        } else {
          this.loginForm.get('otp2').setValue('');
        }
      }
    }
  }

  onClickEdit() {
    this.clearOtp();
  }

  // BACK BUTTON CLICK EVENT HANDLER on browser back button
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.clearOtp();
  }

  private clearOtp() {
    this.countdownSubscription?.unsubscribe();
    this.time = new Date(0, 0, 0, 0, 2, 0);
    this.otpScreen = false;
    this.loginForm.get('otp1').setValue('');
    this.loginForm.get('otp2').setValue('');
    this.loginForm.get('otp3').setValue('');
    this.loginForm.get('otp4').setValue('');
    this.loginForm.get('otp1').clearValidators();
    this.loginForm.get('otp2').clearValidators();
    this.loginForm.get('otp3').clearValidators();
    this.loginForm.get('otp4').clearValidators();
    this.loginForm.get('otp1').updateValueAndValidity();
    this.loginForm.get('otp2').updateValueAndValidity();
    this.loginForm.get('otp3').updateValueAndValidity();
    this.loginForm.get('otp4').updateValueAndValidity();
  }

  protected readonly CountryISO = CountryISO;
  textLabels = {
    mainLabel: 'Mobile number',
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: 'This field is required',
  };
}

// sign-in  -> actions -> effects -> service -> effects -> actions -> reducer -> store -> selector -> component
