import { axiosInstance } from "@/app/api/axiosInstance";
import { useApprovalDocument, useApprovalForm, useApprovalLine, useBaseCode } from "@/entities/approvalLine";
import { useUser } from "@/entities/user";
import { useFundBank } from "@/entities/welfare";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UIDatePicker, UIIconButton, UIInput, UISelect, UIToast } from "@/shared/ui";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";




export const Fund = () => {
  const navigate = useNavigate();
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });

  const [fieldDisable, setFieldDisable] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(true);

  const [reason, setReason] = useState();
  const [relation, setRelation] = useState([]);
  const [form, setForm] = useState({
    files: [
      {
        fileSeqNo: "",
        fileName: "",
        fileSn: "",
        url: "",
        atchFileId: ""
      }
    ],
    filePath: "SYSTEM,PGMG",
    cncCode: "",
    supportInd: "",
    emplNo: "",
    emplNameHan: "",
    orgNameHan: "",
    positionNameHan: "",
    eventDate: "",
    relCode: "",
    objNameHan: "",
    addRegEmplNo: "",
    addRegEmplNameHan: "",
    remark: "",
    costCenter: "",
    costName: "",
    acctCode: "",
    payAmt: "",
    budgetAmt: "",
    leaveCnt: "",
    bankCd: "",
    acctNo: "",
    acctDepositor: "",
    reqRemark: "",
    atchFileId: "",
    fileItemCheck0: "",
    reqEmplNo: "",
    reqEmplName: "",
    docNo: "",
    statusCode: "",
    docTitlNm: "",
    formId: "",
    pgmId: "",
    mblPgmId: "",
    saveFlag: "",
    bfDocNo: "",
    wreathInd: "",
    artmouInd: "",
    addRegEmplOrg: "",
    aprvPathOrder: "",
    payType: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({
    cncCode: false,
    eventDate: false,
    relCode: false,
    objNameHan: false,
  }); // 에러 메시지 관리



  // 결재선
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: approvalFormData, isLoading: isApprovalFormLoading, error: approvalFormError } = useApprovalForm();
  if (isApprovalFormLoading) return <p>Loading...</p>;
  if (approvalFormError) return <p>Something went wrong!</p>;
  const selectedForm = approvalFormData?.filter((i) => i.formId === "CL")[0]
  
  const { data: approvalLineData, isLoading: isApprovalLineLoading, error: approvalLineError } = useApprovalLine({
    formId: selectedForm?.formId,
    emplNo: userData.loginUserId
  });
  if (isApprovalLineLoading) return <p>Loading...</p>;
  if (approvalLineError) return <p>Something went wrong!</p>;

  const { data: approvalDocumentData, isLoading: isApprovalDocumentLoading, error: approvalDocumentError } = useApprovalDocument(userData.loginUserId);
  if (isApprovalDocumentLoading) return <p>Loading...</p>;
  if (approvalDocumentError) return <p>Something went wrong!</p>;


  // 경조 유형 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "CN03", "effDateYn": true, "companyYn": true, "etc1Value": "Y" },
      { "patternCode": "CN08", "effDateYn": true, "etc1Value": "Y", "companyYn": true },
      { "patternCode": "PR02", "effDateYn": true, "companyYn": true },
      { "patternCode": "CN12", "effDateYn": true, "companyYn": true },
      { "patternCode": "CN09", "effDateYn": true, "companyYn": true }
    ]
  }
  const { data: baseCodeData, isLoading: isBaseCodeLoading, error: baseCodeError } = useBaseCode(parameters);
	if (isBaseCodeLoading) return <p>Loading...</p>;
	if (baseCodeError) return <p>Something went wrong!</p>;
  const codeData = baseCodeData && baseCodeData.map((code: any) =>
    code.cdbaseList.map((cd: any) => (
      {codeKey : cd.baseCode, codeName: cd.codeNameHan}
    ))
  )
  const welfareFundCodeData = codeData[0];
  const welfareFundCodeDataTarget = welfareFundCodeData?.slice(0, -1).map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}});
  const codeBaseBankName = codeData[2]?.filter((item: any) => item.codeKey === form.bankCd)[0]?.codeName;

  // 신청자 계좌 / 코스트센터 / 계정 세팅
  const { data: fundBankData, isLoading: isFundBankLoading, error: fundBankError } = useFundBank({ emplNo: userData.loginUserId, coCode: userData.loginCoId });
  if (isFundBankLoading) return <p>Loading...</p>;
  if (fundBankError) return <p>Something went wrong!</p>;



  // 신청자 코스트센터


  // 신청자 계정(세팅)











  // useEffect(() => {
  //   if (approvalLineData && approvalLineData.length > 0) {
  //     const updatedAprvdetailDtoList = approvalLineData.map((item, index) => ({
  //       aprvType: item.aprvType,
  //       aprvSeqNo: index + 1,
  //       aprvEmplNo: item.emplNo,
  //       statusCode: item.aprvDepth
  //     }));
  //     setForm((prevForm: any) => ({
  //       ...prevForm,
  //       aprvdetailDtoList: updatedAprvdetailDtoList,
  //     }));
  //   }


  //   if (fundBankData) {
  //     // setForm((prevForm) => ({
  //     //   ...prevForm,
  //     //   bankCd: fundBankData.acct[0].bankCd
  //     // }));
  //     // console.log(fundBankData)
  //   }
  // }, [approvalLineData, fundBankData]);



  useEffect(() => {
    if (!fundBankData || !fundBankData.acct || !fundBankData.cost) {
      return; // 데이터가 없으면 실행하지 않음
    }
    // 결재 라인-기안서 세팅 + 신청자정보(계좌 등) 세팅
    setForm((prev) => ({
      ...prev,      
      acctNo: fundBankData.acct[0]?.payacctNo || "",
      bankCd: fundBankData.acct[0]?.bankCode || "",
      costCenter: fundBankData.cost[0]?.costCd || "",
      costName: fundBankData.cost[0]?.costNm || "",
      bankCode: fundBankData.acct[0]?.bankCode || "",
      payacctDepositorName: fundBankData.acct[0]?.payacctDepositorName || "",
      payacctNo: fundBankData.acct[0]?.payacctNo || "",      
      supportInd: "C",
      payType: "5", // 계정에 따른 타입 기타외부인은 모바일에서는 미표기해서 고정값으로함
      placeNo: 1000,
      acctDepositor: fundBankData.acct[0].payacctDepositorName,
      emplNo: userData.loginUserId,
      emplNameHan: userData.loginUserNm,
      orgNameHan: userData.loginDeptName,
      positionNameHan: userData.loginPstnName,
      addRegEmplNo: userData.loginUserId,
      addRegEmplNameHan: userData.loginUserNm,
      statusCode: "1",
      saveFlag: "Y",
      docNo: approvalDocumentData,
      docTitlNm: `${selectedForm?.formName}-${userData.loginUserNm}`,
      formId: selectedForm?.formId,
      pgmId: selectedForm?.pgmId,
      reqEmplNo: userData.loginUserId,
      reqEmplName: userData.loginUserNm,
    }));
  }, [userData, approvalLineData, approvalDocumentData, fundBankData])


  const handleSelect = async (item: any) => {
    const { data } = await axiosInstance.get(`/uhr/docappr/apprcn600/relcodelist?cncCode=${item}`);
    const transformedData = data.map((item: any) => ({
      label: item.relCodeName,
      error: false,
      query: item.relCode,
    }));
    setReason(item);
    setRelation(transformedData);
  }


  const [acctCodeName, setAcctCodeName] = useState("");
  const handleSelectRelation = async (item: any) => {
    if (!reason) return;
    const responsePay = await axiosInstance.get(`/uhr/docappr/apprcn600/cnpayrule?supportInd=${form.supportInd}&cncCode=${reason}&relCode=${item}&eventDate=${form.eventDate}&costCenter=${form.costCenter}&acctCode=`);
    const responseAcct = await axiosInstance.get(`/uhr/docappr/apprcn600/setacct?payType=${form.payType}&emplNo=${form.reqEmplNo}&eventDate=${form.eventDate}&costCenter=${form.costCenter}`);
    const responseApprovalLine = await axiosInstance.get(`/system/aprvlineset/default?emplNo=${form.emplNo}&recvEmplNo=${form.emplNo}&ccCode=${form.costCenter}&cncCode=1&formId=CL`); //formId, cncCode 고정

    const subjectTarget = codeData[1].filter((code: any) => code.codeKey === item)[0].codeName;
    const eventTarget = codeData[0].filter((code: any) => code.codeKey === form.cncCode)[0].codeName;

    if (subjectTarget === "본인") {
      setForm((prevForm) => ({
        ...prevForm,
        sapTxt: eventTarget,
        leaveCnt: responsePay.data[0].leaveCnt,
        objNameHan: userData.loginUserNm,
        payAmt: responsePay.data[0].payAmt,
        acctCode: responseAcct.data[0].acctCode,
        aprvPathOrder: responseApprovalLine.data.map((item: any) => item.emplNameHan).join("^"),
        aprvdetailDtoList: responseApprovalLine.data.map((item: any, index: any) => ({
          docNo: approvalDocumentData,
          aprvSeqNo: index + 1,
          aprvType: item.aprvType,
          aprvEmplNo: item.emplNo,
          transInd: "",
          tarnsEmplNo: "",
          statusCode: item.aprvDepth,
        }))
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        objNameHan: false
      }));
      setAcctCodeName(responseAcct.data[0].acctNm);
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        sapTxt: eventTarget,
        leaveCnt: responsePay.data[0].leaveCnt,
        payAmt: responsePay.data[0].payAmt,
        acctCode: responseAcct.data[0].acctCode,
        aprvPathOrder: responseApprovalLine.data.map((item: any) => item.emplNameHan).join("^"),
        aprvdetailDtoList: responseApprovalLine.data.map((item: any, index: any) => ({
          docNo: approvalDocumentData,
          aprvSeqNo: index + 1,
          aprvType: item.aprvType,
          aprvEmplNo: item.emplNo,
          transInd: "",
          tarnsEmplNo: "",
          statusCode: item.aprvDepth,
        }))
      }));
      setAcctCodeName(responseAcct.data[0].acctNm);
    }
  }


  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  // // 버튼 클릭 핸들러
  // const handleFileClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click(); // 첨부창 열기
  //   }
  // };
  // // 파일 선택 핸들러
  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   setSelectedFiles(files); // 선택된 파일들을 상태로 설정
  //   const { data } = await axiosInstance.post('/files/upload-atchfile', files,
  //     { headers: { 'Content-Type' : 'multipart/form-data' } }
  //   );
  //   const fileList = Array.from(data).map((file:any, index:any) => ({
  //     fileSeqNo: (index + 1).toString(),
  //     fileSn: file.fileSn,
  //     atchFileId: file.atchFileId,
  //     fileName: file.orignlFileNm,
  //     url: ''
  //   }));

  //   setForm((prevForm) => ({
  //     ...prevForm,
  //     atchFileId: fileList[0].atchFileId,
  //     files: fileList,
  //   }));
  // };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  // 버튼 클릭 핸들러
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click(); // 첨부창 열기
    }
  };
  // 파일 선택 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;    
    setSelectedFiles(files); // 선택된 파일들을 상태로 설정
    const { data } = await axiosInstance.post('/files/upload-atchfile', files,
      { headers: { 'Content-Type' : 'multipart/form-data' } }
    );
    if (files) {
      const fileList = Array.from(data).map((file:any, index:any) => ({
            fileSeqNo: (index + 1).toString(),
            fileSn: file.fileSn,
            atchFileId: file.atchFileId,
            fileName: file.orignlFileNm,
            url: ''
          }));
      setSelectedFiles(files); // 상태 업데이트
      setForm((prevForm: any) => ({
        ...prevForm,
        files: Array.from(files),
        atchFileId: fileList[0].atchFileId,
      }));
    }
  };

  const handleFileRemove = (indexToRemove: number) => {
    if (selectedFiles) {
      const updatedFilesArray = Array.from(selectedFiles).filter((_, index) => index !== indexToRemove);
      const dataTransfer = new DataTransfer();
      updatedFilesArray.forEach((file) => dataTransfer.items.add(file));
      const updatedFiles = dataTransfer.files;
      setSelectedFiles(null);
      setForm((prevForm: any) => ({
        ...prevForm,
        // files: Array.from(updatedFiles),
        atchFileId: "",
        files: ""
      }));
    }
  };

  // 선택값 변경
  const handleSelectChange = (field: string, value: any) => {
    setForm((prevForm: any) => {
      const keys = field.split(".");
      let updatedForm = { ...prevForm };
      let current: any = updatedForm;
      keys.forEach((key: any, index) => {
        // 배열 처리를 위한 검사
        if (Array.isArray(current) && !isNaN(Number(key))) {
          key = Number(key); // 인덱스를 숫자로 변환
        }
        if (index === keys.length - 1) {
          current[key] = value; // 값 설정
        } else {
          current[key] = current[key] ? { ...current[key] } : {};
          current = current[key];
        }
      });
      return updatedForm;
    });
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false })); // Clear error on change
  };



  const validateForm = () => {
    const newErrors = {
      // certiCodeKind: !form.certiCodeKind, // 공통 필수값 검증
      cncCode: !form.cncCode,
      eventDate: !form.eventDate,
      relCode: !form.relCode,
      objNameHan: !form.objNameHan,
      files: !form.files
    };
    // 상태 업데이트
    setErrors(newErrors);
    // 오류가 없으면 true 반환
    return Object.values(newErrors).every((error) => !error);
  };


  const handleSave = async () => {
    if (!validateForm()) {
      return;
    } else {

      //현재날짜
      let nowDate = new Date();

      //현재날짜로부터 미래 1달
      const nextMonth = new Date(nowDate.setMonth(nowDate.getMonth()+1));
      const expyear = nextMonth.getFullYear();
      const expmonth = ('0' + (nextMonth.getMonth() + 1)).slice(-2);
      const expday = ('0' + nextMonth.getDate()).slice(-2);
      const expDate = expyear + '' +  expmonth+ '' + expday;

      //현재날짜로부터 과거 3달
      nowDate = new Date();
      const pastMonth = new Date(nowDate.setMonth(nowDate.getMonth()-3));
      const pastyear = pastMonth.getFullYear();
      const pastmonth = ('0' + (pastMonth.getMonth() + 1)).slice(-2);
      const pastday = ('0' + pastMonth.getDate()).slice(-2);
      const pastDate = pastyear + "" +  pastmonth+ "" + pastday;
      
      if (Number(form.eventDate.replace("-","").replace("-","")) - Number(pastDate) < 0 || Number(form.eventDate.replace("-","").replace("-","")) - Number(expDate) > 0){
        alert("경조금의 신청 가능 기간이 아닙니다.");
        form.eventDate = "";
        return false;
      }

      const formData = new FormData();
      const appendFormData = (data: any, parentKey = '') => {
        if (typeof data === 'object' && !Array.isArray(data) && !(data instanceof File)) {
          // 객체 처리
          Object.entries(data).forEach(([key, value]) => {
            appendFormData(value, parentKey ? `${parentKey}.${key}` : key);
          });
        } else if (Array.isArray(data)) {
          // 배열 처리 (특히 files와 같은 배열 포함)
          data.forEach((item, index) => {
            appendFormData(item, `${parentKey}[${index}]`);
          });
        } else if (data instanceof File) {
          // File 객체 처리
          formData.append(parentKey, data);
        } else {
          // 기본 데이터 처리
          formData.append(parentKey, data);
        }
      };
      appendFormData(form);

      try {
        const response = await axiosInstance.post("/uhr/docappr/apprcn600", formData);
        
        if (response.status === 200 && response.data) {
          setOpenToast({ message: "임시저장이 완료되었습니다.", type: "success", open: true });
          setTimeout(async () => {
            setFieldDisable(true);
            setOpenToast((prev) => ({ ...prev, open: false }));
            setDisableSave(true);
            setDisableApply(false);
            setForm((prevForm) => ({
              ...prevForm,
              statusCode: "3",
            }));
          }, 1000);
        } else {
          setOpenToast({ message: "요청에 이상이 있습니다.", type: "danger", open: true });
        }
      } catch (error: any) {
        setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
      }
    }
  }


  // 신청하기
  const handleApply = async () => {
    const formData = new URLSearchParams();
    const appendFormData = (data: any, parentKey = '') => {
      if (typeof data === 'object' && !Array.isArray(data)) {
        Object.entries(data).forEach(([key, value]) => {
          appendFormData(value, parentKey ? `${parentKey}.${key}` : key);
        });
      } else if (Array.isArray(data)) {
        data.forEach((item, index) => {
          appendFormData(item, `${parentKey}[${index}]`);
        });
      } else {
        formData.append(parentKey, data);
      }
    };
    appendFormData(form);
    try {
      const responseSend = await axiosInstance.post("/uhr/docappr/apprcn600/send", formData);
      if (responseSend.data.rsltCode === "F") {
        alert(responseSend.data.rsltMsg);
      } else {
        const { data } = await axiosInstance.post('/system/aprvlineset', formData);
        if (data === true) {
          setOpenToast({message: "신청이 완료되었습니다.", open: true, type: "success"});
          setTimeout(() => {
            setOpenToast((prev) => ({ ...prev, open: false }));
            setDisableApply(true);
            navigate("/welfare");
          }, 1000);
        } else {
          setOpenToast({message: "요청에 이상이 있습니다.", open: true, type: "danger"});
          setTimeout(() => {
            setOpenToast((prev) => ({ ...prev, open: false }));
          }, 1000);
        }
      }
    } catch (error: any) {
      setOpenToast({message: error.response.data.message, open: true, type: "danger"});
      setTimeout(() => {
        setOpenToast((prev) => ({ ...prev, open: false }));
      }, 1000);
    }
  }

  


  return (
    <>
      <div className="d-flex pt-10 pb-10 flex-direction-column">
        <UISelect
          label="경조사유"
          items={welfareFundCodeDataTarget}
          onQuerySelect={(value) => {
            handleSelect(value);
            handleSelectChange("cncCode", value);
          }}
          error={errors.cncCode}
          hint={errors.cncCode ? "필수값입니다." : ""}
          readOnly={fieldDisable}
        />
      </div>
      <div className="d-flex pt-10 pb-10 flex-direction-column">
        <UIDatePicker
          label="경조발생일"
          onDateSelect={(value) => handleSelectChange("eventDate", formatByType("date", value)) }
          error={errors.eventDate}
          hint={errors.eventDate ? "경조발생일을 선택해주세요." : ""}
          readOnly={fieldDisable}
        />
      </div>
      <div className="d-flex pt-10 pb-10 gap-10">
        <div className="d-flex">
          <UISelect
            label="관계"
            items={relation}
            onQuerySelect={(value) => {
              handleSelectRelation(value);
              handleSelectChange("relCode", value);
            }}
            readOnly={form.eventDate === "" || fieldDisable ? true : false}
            error={errors.relCode}
            hint={errors.relCode ? "필수값입니다." : ""}
          />
        </div>
        <div className="d-flex align-items-end">
          <UIInput
            label="대상자"
            placeholder="대상자 성명 기재"
            value={form.objNameHan}
            onChange={(e) => handleSelectChange("objNameHan", e.target.value)}
            error={errors.objNameHan}
            hint={errors.objNameHan ? "필수값입니다." : ""}
            readOnly={fieldDisable}
          />
        </div>
      </div>


      <div className="d-flex pt-10 pb-10 gap-10">
        <div className="d-flex">
          <UIInput
            label="코스트센터"
            value={form.costCenter}
            // readOnly={form.eventDate === "" ? true : false}
            // error={errors.relCode}
            // hint={errors.relCode ? "필수값입니다." : ""}
            readOnly
          />
        </div>
        <div className="d-flex align-items-end">
          <UIInput
            label=""
            value={form.costName}
            onChange={(e) => handleSelectChange("objNameHan", e.target.value)}
            readOnly
          />
        </div>
      </div>
      <div className="d-flex pt-10 pb-10 flex-direction-column">
        {/* <UISelect label="계정" items={account} /> */}
        <UIInput label="계정" value={acctCodeName} readOnly />
      </div>
      <div className="d-flex pt-10 pb-10 flex-direction-column">
        <UIInput label="지급금액" readOnly placeholder={form.payAmt} />
      </div>
      <div className="d-flex pt-10 pb-10">
        <UIInput label="은행" readOnly placeholder={codeBaseBankName} />
      </div>
      <div className="d-flex pt-10 pb-10">
        <UIInput label="계좌정보" readOnly placeholder={form.acctNo} />
      </div>


      <div className="pt-10 pb-180">
        <div className="attach__file">
          <input
            type="file"
            ref={fileInputRef} // useRef로 파일 입력 요소 참조
            style={{ display: "none" }} // 화면에 보이지 않게 숨김
            onChange={handleFileChange}
            multiple // multiple 속성 추가
          />
          <UIInput label="첨부파일" placeholder="증빙서류첨부" disabled  error={!selectedFiles}
            hint={!selectedFiles? "증빙서류첨부는 필수입니다." : ""}
            />
          <UIIconButton onClick={handleFileClick} className="is-file has-pressed-action" />
        </div>
        {selectedFiles && (
          <ul className="attach__file__list">
            {Array.from(selectedFiles).map((file, index) => (
              <li key={index}>
                <UIInput value={file.name} readOnly />
                <div className="icon is-delete mt-10 ml-10 mr-10" onClick={() => handleFileRemove(index)}></div>
              </li>
            ))}
          </ul>
        )}
      </div>


      <div className="applyAction">
        <UIAlert
          description="저장하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleSave();
            },
          }}
        >
          <UIButton type="border" disabled={disableSave}>저장</UIButton>
        </UIAlert>
        <UIAlert
          description="신청하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply();
            },
          }}
        >
          <UIButton type="primary" disabled={disableApply}>결재요청</UIButton>
        </UIAlert>
      </div>
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  );
};