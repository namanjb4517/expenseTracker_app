import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JourneyPage } from './journey.page';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: JourneyPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JourneyPageRoutingModule {}
