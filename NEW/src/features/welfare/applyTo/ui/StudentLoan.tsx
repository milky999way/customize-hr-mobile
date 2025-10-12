import { axiosInstance } from "@/app/api/axiosInstance";
import { useDateStore } from "@/app/store/authStore";
import { useBaseCode } from "@/entities/approvalLine";
import { useStudentLoan } from "@/entities/welfare/api/useWelfare";
import { getDaysBetweenDates } from "@/shared/lib/daysBetweenDates";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UIDatePicker, UIIconButton, UIInput, UISelect, UIToast } from "@/shared/ui";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


export const StudentLoan = () => {
  const navigate = useNavigate();
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });

  const {currentDate, setCurrentDate} = useDateStore();
  const toDay = currentDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [day, setDay] = useState<string>(toDay);

  const [form, setForm] = useState({
    reqSeqNo: "0",
    reqDate: toDay.replace("-","").replace("-",""),
    payDate: "",
    resNoFamily: "",
    atchFileId: "",
    shpayreq: {
      schoolCodeInd: "",
      schoolKindCode: "",
      semesterCode: "",
      schoolNameHan: "",
      relCode: "",
      reqAmt: 0,
      payAmt: 0,
      schYear: "",
      reqCnt: "",
    },
    shpayreqfileList: [
      {
        fileSeqNo: "",
        fileName: "",
        fileSn: "",
        url: "",
        atchFileId: ""
      }
    ]
  });



  const [errors, setErrors] = useState<Record<string, any>>({
    reqSeqNo: false,
    reqDate: false,
    payDate: false,
    resNoFamily: false,
    atchFileId: false,
    shpayreq: {
      schoolCodeInd: false,
      schoolKindCode: false,
      semesterCode: false,
      schoolNameHan: false,
      relCode: false,
      reqAmt: false,
      payAmt: false,
      schYear: false,
      reqCnt: false,
    },
  }); // 에러 메시지 관리


  const { data, isLoading, error } = useStudentLoan();
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong!</p>;
  const studentTarget = data.map((item) => { return {label: item.familyNameHan, error: false, query: {qs1: item.resNoFamily, qs2: item.relCode}} })
  
  const parameters = {
    baseCodList: [
      { "patternCode": "PS22", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH04", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH02", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH03", "effDateYn": true, "companyYn": true, "etc1Value": "Y" },
      { "patternCode": "SH17", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH15", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH08", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH18", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH24", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH03", "effDateYn": true, "companyYn": true, "etc1Value": "Y" },
      { "patternCode": "SH04", "effDateYn": true, "companyYn": true, "etc3Value": "Y" },
      { "patternCode": "SH08", "effDateYn": true, "companyYn": true, "etc1Value": "Y" },
      { "patternCode": "SH24", "effDateYn": true, "companyYn": true, "etc1Value": "Y" },
      { "patternCode": "SH04", "effDateYn": true, "companyYn": true, "etc1Value": "U" },
      { "patternCode": "SH05", "effDateYn": true, "companyYn": true },
      { "patternCode": "SH03", "effDateYn": true, "companyYn": true, "etc4Value": "Y" },
      { "patternCode": "SH03", "effDateYn": true, "companyYn": true, "etc1Value": "Y" },
      { "patternCode": "SH03", "effDateYn": true, "companyYn": true }
    ]
  }
  const { data: baseCodeData, isLoading: isBaseCodeLoading, error: baseCodeError } = useBaseCode(parameters);
	if (isBaseCodeLoading) return <p>Loading...</p>;
	if (baseCodeError) return <p>Something went wrong!</p>;
  const codeData = baseCodeData && baseCodeData.map((code: any, index) =>
    code.cdbaseList.map((cd: any) => (
      {codeKey : cd.baseCode, codeName: cd.codeNameHan}
    ))
  )
  const loanType = codeData[14]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const schoolType = codeData[15]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const schoolLoanType = codeData[16]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})


  // const [fileField, setFileField] = useState<boolean>(false);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  // // 버튼 클릭 핸들러
  // const handleFileClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click(); // 첨부창 열기
  //   }
  // };
  // // 파일 선택 핸들러
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files) {
  //     setSelectedFiles(files); // 상태 업데이트
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       files: Array.from(files)
  //     }));
  //   }
  // };

  // const handleFileRemove = (indexToRemove: number) => {
  //   if (selectedFiles) {
  //     const updatedFilesArray = Array.from(selectedFiles).filter((_, index) => index !== indexToRemove);
  //     const dataTransfer = new DataTransfer();
  //     updatedFilesArray.forEach((file) => dataTransfer.items.add(file));
  //     const updatedFiles = dataTransfer.files;
  //     setSelectedFiles(updatedFiles);
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       files: Array.from(updatedFiles),
  //     }));
  //   }
  // };
  const [fileField, setFileField] = useState<boolean>(true);
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
    const { data } = await axiosInstance.post("/files/upload-atchfile", files,
      { headers: { "Content-Type" : "multipart/form-data" } }
    );
    const fileList = Array.from(data).map((file:any, index:any) => ({
      fileSeqNo: (index + 1).toString(),
      fileSn: file.fileSn,
      atchFileId: file.atchFileId,
      fileName: file.orignlFileNm,
      url: ""
    }));

    setForm((prevForm) => ({
      ...prevForm,
      atchFileId: fileList[0].atchFileId,
      shpayreqfileList: fileList
    }));
  };
  const handleFileRemove = (indexToRemove: number) => {
    if (selectedFiles) {
      const updatedFiles = Array.from(selectedFiles).filter((_, index) => index !== indexToRemove);
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach(file => dataTransfer.items.add(file));
      setSelectedFiles(null);
      setForm((prevForm) => ({
        ...prevForm,
        atchFileId: "",
      }));
    }
  };


  // 입력값 변경
  // const handleInputChange = (field: string, value: any) => {
  //   setForm((prevForm: any) => {
  //     const keys = field.split(".");
  //     let updatedForm = { ...prevForm };
  //     let current: any = updatedForm;
  //     keys.forEach((key: any, index) => {
  //       // 배열 처리를 위한 검사
  //       if (Array.isArray(current) && !isNaN(Number(key))) {
  //         key = Number(key); // 인덱스를 숫자로 변환
  //       }
  //       if (index === keys.length - 1) {
  //         current[key] = value; // 값 설정
  //       } else {
  //         current[key] = current[key] ? { ...current[key] } : {};
  //         current = current[key];
  //       }
  //     });
  //     return updatedForm;
  //   });
  // };




  // 선택값 변경
  const handleSelectChange = (field: string, value: any) => {

    if(field === "shpayreq.schoolCodeInd"){
      setForm((prevForm) => ({
        ...prevForm,
        shpayreq: {
          ...prevForm.shpayreq,
          reqAmt: 0,
        },
      }));
    }
    
    setForm((prevForm) => {
      const keys = field.split(".");
      const updatedForm = { ...prevForm };

      // 중첩된 필드 값 업데이트
      keys.reduce((current: any, key: string, index: number) => {
        if (index === keys.length - 1) {
          current[key] = value; // 최종 키에 값 설정
        } else {
          if (!current[key] || typeof current[key] !== "object") {
            current[key] = {}; // 중첩 객체 초기화
          }
        }
        return current[key];
      }, updatedForm);

      return updatedForm;
    });

    // 에러 상태 초기화
    setErrors((prevErrors) => {
      const keys = field.split(".");
      const updatedErrors = { ...prevErrors };

      keys.reduce((current: any, key: string, index: number) => {
        if (index === keys.length - 1) {
          current[key] = false; // 에러 상태 초기화
        } else {
          if (!current[key] || typeof current[key] !== "object") {
            current[key] = {}; // 중첩 에러 객체 초기화
          }
        }
        return current[key];
      }, updatedErrors);

      return updatedErrors;
    });
  };



  const validateForm = () => {
    // 재귀적으로 중첩된 필드를 검증하는 유틸리티 함수
    const validateNestedFields = (obj: any): any => {
      return Object.keys(obj).reduce((errors: any, key: string) => {
        const value = obj[key];
  
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // 중첩된 객체 처리
          errors[key] = validateNestedFields(value);
        } else {
          // 단일 값 처리 (값이 없으면 에러로 간주)
          errors[key] = !value;
        }
  
        return errors;
      }, {});
    };
    // const validateNestedFields = (data: any, parentKey = ""): any => {
    //   return Object.keys(data).reduce((errors: any, key: string) => {
    //     const value = data[key];
    //     const fullKey = parentKey ? `${parentKey}.${key}` : key;
    
    //     // 특정 조건에 따라 검증 제외
    //     if (key === "relCode" || key === "reqAmt" || key === "payAmt" || key === "schoolCodeInd" || key === "schoolNameHan" || key === "schYear" || key === "semesterCode" || key === "payDate") {
    //       if (form.shpayreq.schoolKindCode === "ED") {
    //         errors[key] = !value; // 값이 없으면 에러
    //       }
    //     } else if (typeof value === "object" && value !== null) {
    //       // 중첩된 객체 처리
    //       errors[key] = validateNestedFields(value, fullKey);
    //     } else {
    //       // 기본 값 처리
    //       errors[key] = !value; // 값이 없으면 에러
    //     }
    //     return errors;
    //   }, {});
    // };
  
    // 초기 에러 상태 생성
    const newErrors = {
      resNoFamily: !form.resNoFamily,
      reqSeqNo: !form.reqSeqNo,
      reqDate: !form.reqDate,
      payDate: form.shpayreq.schoolKindCode === "ED" && !form.payDate,
      atchFileId: !form.atchFileId,
      shpayreq: Object.fromEntries(
        Object.entries({
          schoolKindCode: !form.shpayreq.schoolKindCode,
          schoolCodeInd: !form.shpayreq.schoolCodeInd,
          reqAmt: form.shpayreq.reqAmt === 0  || !form.shpayreq.reqAmt,
          
          relCode: form.shpayreq.schoolKindCode === "ED" && !form.shpayreq.relCode,
          payAmt: form.shpayreq.schoolKindCode === "ED" && !form.shpayreq.payAmt,
          schoolNameHan: form.shpayreq.schoolKindCode === "ED" && !form.shpayreq.schoolNameHan,
          schYear: form.shpayreq.schoolKindCode === "ED" && !form.shpayreq.schYear,
          semesterCode: form.shpayreq.schoolKindCode === "ED" && !form.shpayreq.semesterCode,
        }).filter(([_, value]) => value !== undefined) // 조건에 따라 필터링
      ),
    };
  
    // 상태 업데이트
    setErrors(newErrors);
  
    // 에러 상태 확인
    const hasErrors = (obj: any): boolean => {
      return Object.values(obj).some((value) => {
        if (typeof value === "object" && value !== null) {
          return hasErrors(value); // 중첩된 에러 확인
        }
        return value === true; // 에러가 있으면 true 반환
      });
    };
  
    // 최종 검증 결과 반환
    return !hasErrors(newErrors);
  };




  const handleApply = async () => {
    const isValid = validateForm();
    console.log("Validation Result:", isValid, "Errors:", errors);
  
    if (!isValid) {
      // alert("폼 검증에 실패했습니다. 필수 항목을 확인하세요.");
      return;
    }
  
    const formData = new FormData();
  
    const appendFormData = (data: any, parentKey = "") => {
      if (typeof data === "object" && !Array.isArray(data) && !(data instanceof File)) {
        Object.entries(data).forEach(([key, value]) => {
          appendFormData(value, parentKey ? `${parentKey}.${key}` : key);
        });
      } else if (Array.isArray(data)) {
        data.forEach((item, index) => {
          appendFormData(item, `${parentKey}[${index}]`);
        });
      } else if (data instanceof File) {
        formData.append(parentKey, data);
      } else {
        formData.append(parentKey, data);
      }
    };
  
    console.log("Form Data Before Append:", form);
    appendFormData(form);
  
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value); // 디버깅: FormData 확인
    }
  
    try {
      const response = await axiosInstance.post("/wlf/wlfstuapply/wlfstuapply111/mobile", formData);
  
      if (response.status === 200 && response.data) {
        setOpenToast({message: "신청이 완료되었습니다.", open: true, type: "success"});
        setTimeout(() => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          navigate("/welfare");
        }, 1000);
      } else {
        // console.error("Unexpected response:", response);
        setOpenToast({ message: "결재요청에 이상이 있습니다.", open: true, type: "danger" });
      }
    } catch (error: any) {
      // console.error("Error during POST:", error);
      setOpenToast({ message: error.response?.data?.message || "오류가 발생했습니다.", open: true, type: "danger" });
    }
  };


  const uiYearInputRef = useRef<any>(null);
  const uiAmountInputRef = useRef<any>(null);
  const checkNumber = (value:any) => {
    if(value !== ""){
      if(isNaN(value) || value.length > 1|| value < 1){
        alert("학년 항목은 한자리 숫자만 입력 가능합니다.");                    
        handleSelectChange("shpayreq.schYear", "");
        uiYearInputRef.current.clearInput();
        return false;      
      }else if(value > 4){
        alert("4학년 이하로 입력 가능합니다.");                    
        handleSelectChange("shpayreq.schYear", "");
        uiYearInputRef.current.clearInput();
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  };

  
  return (
    <>
      <div className="pt-10 pb-10">
        <UISelect
          label="대상자(자녀)"
          items={studentTarget}
          onQuerySelect={(value: any) => {
            handleSelectChange("resNoFamily", value.qs1);
            handleSelectChange("shpayreq.relCode", value.qs2);
          }}
          error={errors.resNoFamily}
          hint={errors.resNoFamily ? "필수값입니다." : ""}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect label="학자금구분" items={loanType}
          onQuerySelect={(value) => {
            handleSelectChange("shpayreq.schoolKindCode", value);
            // handleSelectChange("shpayreq.reqAmt", 300000)
            // handleSelectChange("shpayreq.payAmt", 300000)
            if (value === "EN") {
              setForm((prevForm) => ({
                ...prevForm,
                shpayreq: {
                  ...prevForm.shpayreq,
                  reqAmt: 300000,
                },
              }));
            } else {
              setForm((prevForm) => ({
                ...prevForm,
                shpayreq: {
                  ...prevForm.shpayreq,
                  reqAmt: 0,
                },
              }));
            }
          }}
          error={errors.shpayreq.schoolKindCode}
          hint={errors.shpayreq.schoolKindCode ? "필수값입니다." : ""}
        />
      </div>



      <div className="pt-10 pb-10">
        {form.shpayreq.schoolKindCode === 'EN' ?
          <UISelect
            label="학교구분"
            items={schoolType}
            onQuerySelect={(value) => handleSelectChange("shpayreq.schoolCodeInd", value)}
            error={errors.shpayreq.schoolCodeInd}
            hint={errors.shpayreq.schoolCodeInd ? "필수값입니다." : ""}
          />
        :
          <UISelect
            label="학교구분"
            items={schoolLoanType}
            onQuerySelect={(value) => handleSelectChange("shpayreq.schoolCodeInd", value)}
            error={errors.shpayreq.schoolCodeInd}
            hint={errors.shpayreq.schoolCodeInd ? "필수값입니다." : ""}
          />
        }
      </div>



      {form.shpayreq.schoolKindCode === 'ED' &&
        <>
          <div className="pt-10 pb-10">
            <UIInput
              label="학교명"
              onChange={(e) => handleSelectChange("shpayreq.schoolNameHan", e.target.value) }
              error={errors.shpayreq.schoolNameHan}
              hint={errors.shpayreq.schoolNameHan ? "필수값입니다." : ""}
            />
          </div>
          <div className="pt-10 pb-10 d-flex gap-8">
            <div className="d-flex">
              <UIInput ref={uiYearInputRef}
                label="학년"
                type="number"
                onChange={(e) => {
                  if(checkNumber(e.target.value)){                  
                   handleSelectChange("shpayreq.schYear", e.target.value) 
                  }
                }}
                error={errors.shpayreq.schYear}
                hint={errors.shpayreq.schYear ? "필수값입니다." : ""}
              />
            </div>
            <div className="d-flex">
              <UISelect label="학기(분기)" items={[
                  {label: "1", error: false, query: "1"},
                  {label: "2", error: false, query: "2"},
                  {label: "3", error: false, query: "3"},
                  {label: "4", error: false, query: "4"},
                ]}
                onQuerySelect={(value) => handleSelectChange("shpayreq.semesterCode", value)}
                error={errors.shpayreq.semesterCode}
                hint={errors.shpayreq.semesterCode ? "필수값입니다." : ""}
              />
            </div>
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="납부일"
              type="date"
              onDateSelect={(value) => {
              if(getDaysBetweenDates(toDay, formatByType("date", value)) > 1){
                alert("납부일은 현재 또는 과거 날짜만 선택 가능합니다.");
                handleSelectChange("payDate", "");
                return false;
              }else{
                  handleSelectChange("payDate", value)
                }
              }}
              error={errors.payDate}
              hint={errors.payDate ? "납부일을 확인해주세요." : ""}
            />
          </div>
        </>
      }



      <div className="pt-10 pb-10">
        <UIInput
          ref={uiAmountInputRef}
          label="신청금액"
          type="number"
          value={form.shpayreq.reqAmt || (form.shpayreq.schoolKindCode === "EN" ? 300000 : "")}
          onChange={(e: any) => {
            const inputValue = Number(e.target.value);
            // console.log("Input value:", inputValue);

            if (form.shpayreq.schoolCodeInd === "HS" && inputValue > 500000) {
              alert("지급한도를 초과할 수 없습니다.");
              uiAmountInputRef.current.clearInput();
              setForm((prevForm) => ({
                ...prevForm,
                shpayreq: {
                  ...prevForm.shpayreq,
                  reqAmt: 0,
                },

              }));
            } else if (form.shpayreq.schoolCodeInd === "US" && inputValue > 5000000) {
              alert("지급한도를 초과할 수 없습니다.");
              uiAmountInputRef.current.clearInput();
              setForm((prevForm) => ({
                ...prevForm,
                shpayreq: {
                  ...prevForm.shpayreq,
                  reqAmt: 0,
                },
              }));
            } else {
              setForm((prevForm) => ({
                ...prevForm,
                shpayreq: {
                  ...prevForm.shpayreq,
                  reqAmt: inputValue,
                  payAmt: inputValue
                },
              }));
            }
            // console.log("Updated form:", form);
            setErrors((prevErrors) => ({
              ...prevErrors.shpayreq,
              shpayreq: {
                reqAmt: false
              }
            }));
          }}
          error={errors.shpayreq.reqAmt}
          hint={errors.shpayreq.reqAmt ? "필수값입니다. 지급한도를 확인해주세요." : ""}
          readOnly={form.shpayreq.schoolKindCode === "EN"}
        />
        <p className="fs-14 pt-10 text-point-1">* 고등학교 : 500,000&nbsp;&nbsp;/&nbsp;&nbsp;대학교 : 5,000,000&nbsp;&nbsp;/&nbsp;&nbsp;입학축하금 : 300,000</p>
      </div>


      <div className="pt-10 pb-10">
        <div className="attach__file">
          <input
            type="file"
            ref={fileInputRef} // useRef로 파일 입력 요소 참조
            style={{ display: "none" }} // 화면에 보이지 않게 숨김
            onChange={handleFileChange}
            multiple // multiple 속성 추가
          />
          <UIInput
            label="첨부파일"
            placeholder="증빙서류첨부"
            disabled
            error={errors.atchFileId}
            hint={errors.atchFileId ? "필수값입니다." : ""}
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
          description="신청하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply();
            },
          }}
        >
          <UIButton type="primary">신청</UIButton>
        </UIAlert>
      </div>
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}