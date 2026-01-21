import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: '/department' }, // redirect to `first-component`
  // { path: '', component: DepartmentComponent },
  // { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
