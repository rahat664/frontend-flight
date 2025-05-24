import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HomeComponent} from './Pages/components/home/home.component';
import {initFlowbite} from "flowbite";

@Component({
  selector: 'app-main',
  imports: [ HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'frontend-practice';

  ngOnInit(): void {
    initFlowbite()
  }
}
