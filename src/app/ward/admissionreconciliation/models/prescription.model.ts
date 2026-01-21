export class DrugDetails {
    SEQ?: number;
    ITM?: number;
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
    PITEMID?: Number;
    ITEMNAME?: String;
    REQUID?: number;
    REQQTY?: number;
    RAISEPRESCSTATUS?: number;
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
  }

  export class InvestigationDetails {
    PID? : number;
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
  }
  export class TeethInfoDetails {
    TID? : number;
    PID? : number;
    RMK? : string;
  }