export class DrugDetails {
    SEQ?: number;
    ITM?: number;
    ITNAME?: string;
    DOS?: string;
    DOID?: number;
    FID?: number;
    DUR?: string;
    DUID?: number;
    SFRM?: string;
    REM?: string;
    ARI?: number;
    STM?: string;
    FQTY?: string;
    EDT?: string;
    CF?: boolean;
    CD?: string;
    IUMVAL?: number;
    QTYUOMID?: number;
    QTY?: number;
    STA?: number;
    UCAFAPR?: boolean;
    GID?: number;
    TQT?: number;
    TID?: number;
    ISPSD?: boolean;
    TPOID?: number;
    PATINS?: string;
    PIID?: number;
    REQQTY?:number;
    REQUID?:number;
    PISTATUS?: number;
    ARID?: number;
    ISDRUGFLOW?: boolean;
    ISPRN?: number;
    PRNREASON?: number;
    LGDA?: string;
    REM2L?: string;
    JUST?: string;
    FCONFIG?: string;
    ISANTIC?: boolean;
    ANTICSTATUS?: number;
    OPACKID?: number;
    DISID?: number;
    MRP?: string;
    DefaultUOMID?: string;
    PrescriptionItemStatusNew?: string="0";
  }

  export class ProcedureDetails {
    PID? : number;
    PROCEDURE? : string;
    SID? : number;
    QTY? : number;
    ISQ? : number;
    REM? : string;
    STID? : number;
    OTYID? : number;
    PRID? : number;
    RTID? : number;
    SLOC? : number;
    SDT? : string;
    TOID? : number;
    ORDERTYPE? : string;
    COMPONENTID? : number;
    COMPONENTNAME? : string;
    APPROVALDATE? : string;
    ISPSD? : boolean;
    FAV? : boolean;
    ISMANDATORY? : boolean;
    TEMPLATE? : string;
    SCREENDESIGNID? : string;
    HOLDINGREASONID? : number;
    ISCONTRASTALLERGIC? : boolean;
    STATUS? : number;
    DISID?: any;
    DEPARTMENTID?: number;
    ProcedureSchedules?: string;
  }

  export class InvestigationDetails {
    PID? : number;
    PROCEDURE?: string;
    SID? : number;
    QTY? : number;
    ISQ? : number;
    SPID? : number;
    REM? : string;
    STID? : number;
    OTYID? : number;
    SPEID? : number;
    ISPSD? : boolean;
    ISMANDATORY? : boolean;
    TEMPLATE? : string;
    SCREENDESIGNID? : number;
    HOLDINGREASONID? : number;
    ISSCHEDULE? : boolean;
    ISNONSTAT? : boolean;
    ISSTATTEST? : boolean;
    STATUS? : number;
    DISID?: any;
    DEPARTMENTID?: number;
  }
  export class TeethInfoDetails {
    TID? : number;
    PID? : number;
    RMK? : string;
  }

  export class IvfDetails {
    SEQ?: number;
    ItemID?: number;
    QTY?: string;
    DET?: string;
    ItemName?: string;
    BaseSolutionID?:string;
    UOMID?: string;
    AdditiveCategoryID?: number;
    ExpiryTime?: string;
  }