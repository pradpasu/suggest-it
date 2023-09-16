import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CategoryPageComponent } from './category-page/category-page.component';

const routes: Routes = [
  {
    component: HomePageComponent,
    path: "",
    
  },
  {
    component: CategoryPageComponent,
    path: "category"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
