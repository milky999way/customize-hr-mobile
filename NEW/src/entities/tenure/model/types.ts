export interface TenureLeaveFlow {
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
  emplNo: string,
  emplNameHan: string,
  mngEmpNo: string,
  mngEmpNm: string,
  rtflowNm: string,
  rtflowType: string,
  rtflowId: string,
  docNo: string,
  returnDate: string,
  wfCode: string,
  wfNm: string,
  host1Ind: string,
  host2Ind: string,
  host3Ind: string,
  host1Nm: string,
  host2Nm: string,
  host3Nm: string,
  host1Type: string,
  host2Type: string,
  host3Type: string,
  retireReqDate: string,
  reqDate: string,
  attachInd: string,
  effFromDate: string,
  effToDate: string,
  displayOrder: string,
  col: string,
  retireReasonName: string,
  retireReasonCode: string,
  colNm: string,
  detailNm: string,
  hostInd: string,
  hostNm: string,
  hostType: string,
  hostNote: string,
  atchFileId: string,
  host1Val: string,
  host2Val: string,
  host3Val: string,
  statusCode: string,
  statusName: string,
  resNo: string,
  seqNo: string,
  requiredFile: string,
  curEditTime: string,
  role: string,
  pgmId: string,
  pgmUrlAd: string,
  orgCode: string,
  orgNameHan: string,
  locCode: string,
  locNameHan: string,
  ctrtFile: string,
  reportId: string,
  sign: string,
  retireGbn: string,
  lastWorkDate: string,
  retireDate: string,
  fromDate: string,
  toDate: string,
  emprt140DtoList: string,
  emprt140FileDtoList: string,
  mpgmId: string,
  mpgmUrlAd: string,
  remplNo: string,
  remplNameHan: string,
  memplNameHan: string,
  memplNo: string,
  scomplYn: string
}


export interface TenureLeaveDetail {
  name: string,
  type: string,
  info: string,
}


export interface TenureLeaveSurvey {
  ans1: string,
  ans2: string,
  ans3: string,
  ans4: string,
  ans5: string,
  ans6: string,
  ans7: string,
  ans8: string,
  ans9: string,
  ans10: string,
  ans11: string,
  ans12: string,
  ans13: string,
  ans14: string,
  ans15: string,
  ans16: string,
  ans17: string,
  ans18: string,
  ans19: string,
  ans20: string,
  emplNo: string,
  surveyNo: string,
  retireReqDate: string,
  coCode: string,
}

export interface TenureLeaveResignation {
  chargeJob: string
  detailReason: string,
  telNo: string,
  docNo: string,
  mblPgmId: string,
  statusCode: string,
  saveFlag: string,
  emlpNo: string,
  emplNameHan: string,
  entranceDate: string,
  workPeriod: string,
  address: string,
}

export interface TenureLeaveHandOver {
  orgNameHan: string,
  emplNo: string,
  positionNameHan: string,
  pgmId: string,
  emplNameHan: string,
  atchFileId: string,
  recvEmplNo: string,
  transferNote4: string,
  coCode: string,
  transferNote3: string,
  transferNote2: string,
  transferNote1: string,
  docTitlNm: string,
  createDate: string,
  formId: string,
  apprvDate: string,
  chk2: string,
  chk3: string,
  chk1: string,
  docNo: string,
  titleNameHan: string,
  recvEmplNameHan: string,
  transferReason: string,
  saveFlag: string,
  reqstDate: string,
  mblPgmId: string,
  statusCode: string
}


// export interface TenureJoinApply {
//   coCode: string,
//   emplNo: string,
//   emplNameHan: string,
//   emplNameFirst: string,
//   emplNameLast: string,
//   emplNameChn: string,
//   emplNameEng: string,
//   emplNameEngFirst: string,
//   emplNameEngLast: string,
//   sexCode: string,
//   outEmail: string,
//   resiplaceZip: string,
//   resiplaceAddr: string,
//   atchFileId1: string,
//   fileSn1: string,
//   fileName1: string,
//   atchFIleId2: string,
//   fileSn2: string,
//   fileName2: string,
//   atchFileId3: string,
//   fileSn3: string,
//   fileName3: string,
//   statusCode: string,
// }



interface PsfmlyList {
  familyNameHan: string | number | undefined
  coCode: string,
	emplNo: string,
	resNoFamily: string,
	relCode: string,
	taxdedAmtInd: string,
	etcContent: string,
}
export interface TenureJoinApply {
  psfmlyList: PsfmlyList[],
  coCode: string,
  emplNo: string,
  emplNameHan: string,
  emplNameFirst: string,
  emplNameLast: string,
  emplNameChn: string,
  emplNameEng: string,
  emplNameEngFirst: string,
  emplNameEngLast: string,
  sexCode: string,
  outEmail: string,
  resiplaceZip: string,
  resiplaceAddr: string,
  atchFileId1: string,
  fileSn1: string,
  fileName1: string,
  atchFIleId2: string,
  fileSn2: string,
  fileName2: string,
  atchFileId3: string,
  fileSn3: string,
  fileName3: string,
  armyCode: string,
  rankCode: string,
  serviceNo: string,
  serviceDateFrom: string,
  serviceDateTo: string,
  rsnCodeDischarge: string,
  statusCode: string,
  pvCodeKind: string,
  pvCodeRel: string,
  pvNo: string,
  retNoticeDate: string,
  noticeInd: string,
  seqNo: string,
  hndcapDate: string,
  hndcapCode: string,
  hndcapCodeKind: string,
  hndcapGradeCode: string,
  hndcapStateCode: string,
  atchFileId: string,
  fileSn: string,
  fileName: string,
  file1: string,
  file2: string,
  filePath: string,
  loginCoId: string,
  file: string,
}

// export interface TenureJoinApply02 {
//   coCode: string,
//   emplNo: string,
//   armyCode: string,
//   rankCode: string,
//   serviceNo: string,
//   serviceDateFrom: string,
//   serviceDateTo: string,
//   rsnCodeDischarge: string,
//   statusCode: string,
// }

// export interface TenureJoinApply08 {
//   coCode: string,
//   emplNo: string,
//   pvCodeKind: string,
//   pvCodeRel: string,
//   pvNo: string,
//   retNoticeDate: string,
//   noticeInd: string,
//   atchFileId: string,
//   fileSn: string,
//   fileName: string,
// }

// export interface TenureJoinApply09 {
//   coCode: string,
//   emplNo: string,
//   seqNo: string,
//   hndcapDate: string,
//   hndcapCode: string,
//   hndcapCodeKind: string,
//   hndcapGradeCode: string,
//   hndcapStateCode: string,
//   atchFileId: string,
//   fileSn: string,
//   fileName: string,
// }



















// export interface TenureJoinApply03 {
//   statusCode: string,
//   psfmlyList: PsfmlyList[],
// }
export interface TenureJoinApplyList {
  coCode: string,
  emplNo: string,
  entranceDate: string,
  grdtnDate: string,
  careerCodeSchool: string,
  schoolName: string,
  majorField: string,
  majorCode: string,
  degreeCode: string,
  degreeNo: string,
  remoteNm: string,
  paper: string,
  atchFileId1: string,
  fileSn1: string,
  fileName1: string,
  atchFIleId2: string,
  fileSn2: string,
  fileName2: string,
  workplaceName: string,
  retireDate: string,
  gradeNameHan: string,
  jobkindNameHan: string,
  jobNameHan: string,
  jobNameDtl: string,
  atchFileId: string,
  fileSn: string,
  fileName: string,
  seqNo: string,
  lisncCodeKind: string,
  lisncCodeGrade: string,
  acquireDate: string,
  lisncNo: string,
  orgNameIssue: string,
  langCode: string,
  testDate: string,
  langTestCode: string,
  totalPoint: string,
  enforceAgency: string,
  remark: string
}












interface PsmstrMblList04 {
  coCode: string,
  emplNo: string,
  entranceDate: string,
  grdtnDate: string,
  careerCodeSchool: string,
  schoolName: string,
  majorField: string,
  majorCode: string,
  degreeCode: string,
  degreeNo: string,
  remoteNm: string,
  paper: string,
  atchFileId1: string,
  fileSn1: string,
  fileName1: string,
  atchFIleId2: string,
  fileSn2: string,
  fileName2: string,
}
export interface TenureJoinApply04 {
  statusCode: string,
  PsmstrMblList: PsmstrMblList04[]
}



interface PsmstrMblList05 {
  coCode: string,
  emplNo: string,
  entranceDate: string,
  grdtnDate: string,
  careerCodeSchool: string,
  schoolName: string,
  majorField: string,
  majorCode: string,
  degreeCode: string,
  degreeNo: string,
  remoteNm: string,
  paper: string,
  atchFileId1: string,
  fileSn1: string,
  fileName1: string,
  atchFIleId2: string,
  fileSn2: string,
  fileName2: string,
}
export interface TenureJoinApply05 {
  statusCode: string,
  PsmstrMblList: PsmstrMblList05[]
}



interface PsmstrMblList06 {
  coCode: string,
  emplNo: string,
  entranceDate: string,
  grdtnDate: string,
  careerCodeSchool: string,
  schoolName: string,
  majorField: string,
  majorCode: string,
  degreeCode: string,
  degreeNo: string,
  remoteNm: string,
  paper: string,
  atchFileId1: string,
  fileSn1: string,
  fileName1: string,
  atchFIleId2: string,
  fileSn2: string,
  fileName2: string,
}
export interface TenureJoinApply06 {
  statusCode: string,
  PsmstrMblList: PsmstrMblList06[]
}


interface PsmstrMblList07 {
  coCode: string,
  emplNo: string,
  entranceDate: string,
  grdtnDate: string,
  careerCodeSchool: string,
  schoolName: string,
  majorField: string,
  majorCode: string,
  degreeCode: string,
  degreeNo: string,
  remoteNm: string,
  paper: string,
  atchFileId1: string,
  fileSn1: string,
  fileName1: string,
  atchFIleId2: string,
  fileSn2: string,
  fileName2: string,
}
export interface TenureJoinApply07 {
  statusCode: string,
  PsmstrMblList: PsmstrMblList07[]
}




