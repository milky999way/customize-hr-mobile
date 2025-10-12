export interface Salary {
  payNameEnv: string,
  paySeqNo: number,
  dedAmt: number,
  baseYear: string,
  incomeAmt: number,
  emplNo: string,
  emplNameHan: string,
  sumAmt: number,
  payDate: string
}
export interface SalaryDetail {
  printNm: string,
  adjDate: string,
  tlevel: string,
  dtlCnt: number,
  displayOrder: number,
  incomeAmt: number,
  payCode: string
}
export interface SalaryDeduct {
  adjDate: string,
  tlevel: string,
  dtlCnt: number,
  dedAmt: number,
  displayOrder: number,
  payNameHan: string,
  payCode: string
}
export interface SalarySeveranceReckon {
  reckon: string;
}


interface PrrtappropDcList {
  workPeriod: string,
  effDateYm: string,
  payAmt: string,
}

interface PrrtappropDbList {
  workPeriod: string,
  effDateYm: string,
  payAmt: string,
}
export interface SalarySeverance {
  loginUserNm: string;
  prrtappropDcList: PrrtappropDcList[];
  prrtappropDbList: PrrtappropDbList[];
}








export interface SalaryAnnual {
  loginCoId: string,
  loginCoNm: string,
  loginCoEngNm: string,
  loginUserId: string,
  loginUserNm: string,
  loginDeptId: string,
  loginDeptName: string,
  loginIdntClCode: string,
  loginTitleCode: string,
  loginTitleName: string,
  loginPstnName: string,
  loginGradeName: string,
  loginEntranceDate: string,
  loginRetireDate: string,
  loginCellularTel: string,
  loginInitPwdYn: string,
  loginPwResetDt: string,
  rowStatus: string,
  chk: string,
  coCode: string,
  seqNo: string,
  year: string,
  emplNo: string,
  birthDate: string,
  phoneNumber: string,
  ctrtStartDate: string,
  ctrtEndDate: string,
  ctrtDate: string,
  annualAmt: string,
  salaryAmt: string,
  payAmt1: string,
  payAmt2: string,
  payAmt3: string,
  payAmt4: string,
  sendDate: string,
  signDate: string,
  remark: string,
  statusCode: string,
  atchFileId: string,
  ctrtFileBfr: string,
  ctrtFileAft: string,
  ctrtFile: string,
  effDateFrom: string,
  newEmpYn: string,
  gradeCode: string,
  gradeNameHan: string,
  orgNameHan: string,
  baseYear: string,
  baseDate: string,
  statusCodeType: string,
  emplNameHan: string,
  prsalaryctrtList: string
}

export interface SalaryHealthIns {
  loginCoId: string,
  loginCoNm: string,
  loginCoEngNm: string,
  loginUserId: string,
  loginUserNm: string,
  loginDeptId: string,
  loginDeptName: string,
  loginIdntClCode: string,
  loginTitleCode: string,
  loginTitleName: string,
  loginPstnName: string,
  loginGradeName: string,
  loginEntranceDate: string,
  loginRetireDate: string,
  loginCellularTel: string,
  loginInitPwdYn: string,
  loginPwResetDt: string,
  rowStatus: string,
  chk: string,
  coCode: string,
  curCode: string,
  emplNo: string,
  yyyy: string,
  totPayAmt: string,
  confmInsurAmt: string,
  dedInsurAmt: string,
  devdInd: string,
  devdCd: string,
  closeInd: string,
  repayAmt: string,
  emplNameHan: string,
  orgCode: string,
  orgNameHan: string,
  gradeNameHan: string,
  miadjDbList: string
}

export interface SalaryIncome {
  
}

export interface SalaryTaxPage {
  
}