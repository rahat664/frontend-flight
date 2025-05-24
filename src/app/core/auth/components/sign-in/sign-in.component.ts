import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatInput} from '@angular/material/input';
import {NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'sign-in',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormField,
    NgIf,
    MatInput,
    MatButton,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  form: FormGroup;

  login() {

  }
}
