import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JourneyPageRoutingModule } from './journey-routing.module';

import { JourneyPage } from './journey.page';
import { HomeComponent } from './components/home/home.component';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { CircleProgressComponent } from './shared/circle-progress/circle-progress.component';
import { ExpenseModalComponent } from './shared/expense-modal/expense-modal.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JourneyPageRoutingModule,
    ReactiveFormsModule,
    NgCircleProgressModule
  ],
  declarations: [JourneyPage, HomeComponent, CircleProgressComponent, ExpenseModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JourneyPageModule {}
