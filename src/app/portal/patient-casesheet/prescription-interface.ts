import { DecimalPipe } from "@angular/common";

export class FoodAllergy {
  REMARKS: string;
  FOODID: string;
  FMD: string; 
  ISACT: string;
  DSC: string;
  ALLERGIETYPES: string;
  BLKRE: string;  

  constructor(REMARKS: string,
    FOODID: string,
    FMD: string,
    ISACT: string,
    DSC: string,
    ALLERGIETYPES: string,
    BLKRE: string) {
      this.REMARKS = REMARKS;
      this.FOODID = FOODID;
      this.FMD = FMD;
      this.ISACT = ISACT;
      this.DSC = DSC;
      this.ALLERGIETYPES = ALLERGIETYPES;
      this.BLKRE = BLKRE;
    }
}

export class DrugAllergy {
  REMARKS: string;
  GENERICID: string;
  FMD: string; 
  ISACT: string;
  DSC: string;
  ALLERGIETYPES: string;
  DrugName: string;

  constructor(REMARKS: string,
    GENERICID: string,
    FMD: string,
    ISACT: string,
    DSC: string,
    ALLERGIETYPES: string,
    DrugName: string) {
      this.REMARKS = REMARKS;
      this.GENERICID = GENERICID;
      this.FMD = FMD;
      this.ISACT = ISACT;
      this.DSC = DSC;
      this.ALLERGIETYPES= ALLERGIETYPES;
      this.DrugName = DrugName;
    }
}

export class OtherAllergy {
  REMARKS: string;
  ALLERGY:string;
  OtherAlrgyID: string;
  FMD: string; 
  ISACT: string;
  DSC: string;
  ALLERGIETYPES: string;
  BLKRE: string;  

  constructor(REMARKS: string,
    OtherAlrgyID: string,
    FMD: string,
    ISACT: string,
    DSC: string,
    ALLERGIETYPES: string,
    BLKRE: string) {
      this.REMARKS = REMARKS;
      this.ALLERGY = REMARKS;
      this.OtherAlrgyID = OtherAlrgyID;
      this.FMD = FMD;
      this.ISACT = ISACT;
      this.DSC = DSC;
      this.ALLERGIETYPES = ALLERGIETYPES;
      this.BLKRE = BLKRE;
    }
}