import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JourneyPageRoutingModule } from './journey-routing.module';

import { JourneyPage } from './journey.page';
import { HomeComponent } from './components/home/home.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JourneyPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [JourneyPage, HomeComponent]
})
export class JourneyPageModule {}
