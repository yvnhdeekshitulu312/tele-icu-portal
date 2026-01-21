import { DecimalPipe } from "@angular/common";

export interface IInvestigations {
    ID: number;
    Name: string;
    SOrN: string;
    Specialisation: string;
    Quantity?: number;
    ServiceItemId?: number;
    SpecialisationId?: number;
    ServiceTypeId?: number;
    SpecimenId?: number;
    Remarks?: string;
    IsFav?: number;
    Status?: number;
    disableDelete?: boolean;
    TATRemarks: string;
    ResultStatus: string;
    ItemPrice: number;
    DISID?: any;
    DEPARTMENTID?: number;
    ProcedureSchedules?: string;
}

export class InvestigationProcedures {
    name: string;
    constructor(name:string) {
      this.name = name;
    }
  }