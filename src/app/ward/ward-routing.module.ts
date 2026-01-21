import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BedsComponent } from './beds/beds.component';
import { WardComponent } from './ward.component';
import { IpvitalsComponent } from './ipvitals/ipvitals.component';
import { LabTrendComponent } from './lab-trend/lab-trend.component';
import { ProgressNoteComponent } from './progress-note/progress-note.component';
import { EndoscopeComponent } from './endoscope/endoscope.component';
import { AdmissionreconciliationComponent } from './admissionreconciliation/admissionreconciliation.component';
import { DischargereconciliationComponent } from './dischargereconciliation/dischargereconciliation.component';
import { ShiftHandoverComponent } from './shift-handover/shift-handover.component';
import { BloodrequestComponent } from './bloodrequest/bloodrequest.component';
import { DrugAdministrationComponent } from './drug-administration/drug-administration.component';
import { BedTransfereRequestComponent } from './bed-transfere-request/bed-transfere-request.component';
import { NursingdashboardComponent } from './nursingdashboard/nursingdashboard.component';
import { SampleCollectionComponent } from './sample-collection/sample-collection.component';
import { UpdateBedstatusComponent } from './update-bedstatus/update-bedstatus.component';
import { MothermilkextractionComponent } from './mothermilkextraction/mothermilkextraction.component';
import { MothermilkfeedingComponent } from './mothermilkfeeding/mothermilkfeeding.component';
import { IntakeoutputComponent } from './intakeoutput/intakeoutput.component';
import { WardnursingdashboardComponent } from './wardnursingdashboard/wardnursingdashboard.component';
import { BedtransferComponent } from './bedtransfer/bedtransfer.component';
import { ProcedureOrderComponent } from './procedure-order/procedure-order.component';
import { DietchartWorklistComponent } from './dietchart-worklist/dietchart-worklist.component';
import { DietCounsellingComponent } from './diet-counselling/diet-counselling.component';
import { MedicationErrorComponent } from './medication-error/medication-error.component';
import { IpIssuesComponent } from './ip-issues/ip-issues.component';
import { IpReturnsComponent } from './ip-returns/ip-returns.component';
import { IcuProgressnotesComponent } from './icu-progressnotes/icu-progressnotes.component';
import { LongtermAdultcareunitComponent } from './longterm-adultcareunit/longterm-adultcareunit.component';
import { AuthguardGuard } from '../authguard.guard';
import { DietPlanWorklistComponent } from './diet-plan-worklist/diet-plan-worklist.component';
import { MedicalEmergencyEventsComponent } from './medical-emergency-events/medical-emergency-events.component';
import { EmrNursingChecklistComponent } from '../templates/emr-nursing-checklist/emr-nursing-checklist.component';
import { IcuProgressnotesNewComponent } from './icu-progressnotes-new/icu-progressnotes-new.component';
import { CarePlanComponent } from './care-plan/care-plan.component';
import { WoundAssessmentComponent } from './wound-assessment/wound-assessment.component';
import { PatientfoldermlComponent } from '../shared/patientfolderml/patientfolderml.component';
import { HospitalEventsComponent } from './hospital-events/hospital-events.component';
import { DischargeCasesComponent } from './discharge-cases/discharge-cases.component';
import { ICUBedsComponent } from './iccu-beds/icu-beds.component';

const routes: Routes = [
  {
    path: '', component: WardComponent, children: [
      { path: '', component: BedsComponent, canActivate: [AuthguardGuard], },
      { path: 'ipvitals', component: IpvitalsComponent, canActivate: [AuthguardGuard], },
      { path: 'labtrend', component: LabTrendComponent, canActivate: [AuthguardGuard], },
      { path: 'progress-note', component: ProgressNoteComponent, canActivate: [AuthguardGuard], },
      { path: 'endoscopy', component: EndoscopeComponent, canActivate: [AuthguardGuard], },
      { path: 'admissionreconciliation', component: AdmissionreconciliationComponent, canActivate: [AuthguardGuard], },
      { path: 'dischargereconciliation', component: DischargereconciliationComponent, canActivate: [AuthguardGuard], },
      { path: 'shifthandover', component: ShiftHandoverComponent, canActivate: [AuthguardGuard], },
      { path: 'bloodrequest', component: BloodrequestComponent, canActivate: [AuthguardGuard], },
      { path: 'DrugAdministration', component: DrugAdministrationComponent, canActivate: [AuthguardGuard], },
      { path: 'TransferRequest', component: BedTransfereRequestComponent, canActivate: [AuthguardGuard], },
      { path: 'nursingdashboard', component: NursingdashboardComponent, canActivate: [AuthguardGuard], },
      { path: 'samplecollection', component: SampleCollectionComponent, canActivate: [AuthguardGuard], },
      { path: 'updatebedstatus', component: UpdateBedstatusComponent, canActivate: [AuthguardGuard], },
      { path: 'mothermilkextraction', component: MothermilkextractionComponent, canActivate: [AuthguardGuard], },
      { path: 'mothermilkfeeding', component: MothermilkfeedingComponent, canActivate: [AuthguardGuard], },
      { path: 'intakeoutput', component: IntakeoutputComponent, canActivate: [AuthguardGuard], },
      { path: 'wardnursingdashboard', component: WardnursingdashboardComponent, canActivate: [AuthguardGuard], },
      { path: 'bedtransfer', component: BedtransferComponent, canActivate: [AuthguardGuard], },
      { path: 'patientfolder', component: PatientfoldermlComponent, canActivate: [AuthguardGuard], },
      { path: 'procedureorder', component: ProcedureOrderComponent, canActivate: [AuthguardGuard], },
      { path: 'dietchart-worklist', component: DietchartWorklistComponent, canActivate: [AuthguardGuard], },
      { path: 'diet-counselling', component: DietCounsellingComponent, canActivate: [AuthguardGuard], },
      { path: 'medicationerror', component: MedicationErrorComponent, canActivate: [AuthguardGuard], },
      { path: 'ip-issues', component: IpIssuesComponent, canActivate: [AuthguardGuard], },
      { path: 'ip-returns', component: IpReturnsComponent, canActivate: [AuthguardGuard], },
      { path: 'icu-progress-note', component: IcuProgressnotesComponent, canActivate: [AuthguardGuard], },
      { path: 'icu-progress-note-new', component: IcuProgressnotesNewComponent, canActivate: [AuthguardGuard], },
      { path: 'longterm-adultcareunit', component: LongtermAdultcareunitComponent, canActivate: [AuthguardGuard], },
      { path: 'diet-plan', component: DietPlanWorklistComponent, canActivate: [AuthguardGuard], },
      { path: 'medical-emr-events', component: MedicalEmergencyEventsComponent, canActivate: [AuthguardGuard], },
      { path: 'emr-nursing-checklist', component: EmrNursingChecklistComponent, canActivate: [AuthguardGuard], },
      { path: 'care-plan', component: CarePlanComponent, canActivate: [AuthguardGuard]},
      { path: 'wound-assessment', component: WoundAssessmentComponent, canActivate: [AuthguardGuard]},
      { path: 'hospital-events', component: HospitalEventsComponent, canActivate: [AuthguardGuard]},
      { path: 'discharge-cases', component: DischargeCasesComponent, canActivate: [AuthguardGuard]},
      { path: 'icu-beds', component: ICUBedsComponent, canActivate: [AuthguardGuard]}
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WardRoutingModule { }
