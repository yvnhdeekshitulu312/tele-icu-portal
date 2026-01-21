import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministrationComponent } from './administration/administration.component';
import { EmployeeComponent } from './employee/employee.component';
import { ProceduresComponent } from './procedures/procedures.component';
import { AuthguardGuard } from '../authguard.guard';
import { RoleComponent } from './role/role.component';
import { MapUserComponent } from './mapuser/mapuser.component';
import { UserLevelAccessComponent } from './userlevelaccess/userlevelaccess.component';

const routes: Routes = [
  {
    path: '', component: AdministrationComponent, children: [
      { path: '', component: AdministrationComponent, canActivate: [AuthguardGuard] },
      { path: 'employee', component: EmployeeComponent, canActivate: [AuthguardGuard] },
      { path: 'procedures', component: ProceduresComponent, canActivate: [AuthguardGuard] },
      { path: 'role', component: RoleComponent, canActivate: [AuthguardGuard] },
      { path: 'mapuser', component: MapUserComponent, canActivate: [AuthguardGuard] },
      { path: 'userlevelaccess', component: UserLevelAccessComponent, canActivate: [AuthguardGuard] }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
