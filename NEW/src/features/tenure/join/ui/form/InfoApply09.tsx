import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useTenureJoinApply } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIDatePicker, UIIconButton, UIInput, UISelect, UIToast } from "@/shared/ui"
import { useEffect, useRef, useState } from "react";



export const InfoApply09 = () => {
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [form, setForm] = useState({
    emplNo: "",
    loginCoId: "",
    hndcapDate: "",
    hndcapCode: "",
    hndcapCodeKind: "",
    hndcapGradeCode: "",
    hndcapStateCode: "",
    file: "",
    atchFileId: "",
    fileSn: "",
    fileName: "",
    filePath: "",
  });



  // 장애 유형 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "PS81", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS47", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS48", "effDateYn": true, "companyYn": true },
      { "patternCode": "PS82", "effDateYn": true, "companyYn": true },
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
  const disorderKind = codeData[0]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const disorderType = codeData[1]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const disorderGrade = codeData[2]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const disorderDegree = codeData[3]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})



  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyData, isLoading: isJoinApplyLoading, error: joinApplyError, refetch: refetchJoinApply } = useTenureJoinApply({
    apiName: "emppsmstinfo320",
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId
  });
  if (isJoinApplyLoading) return <p>Loading...</p>;
  if (joinApplyError) return <p>Error: {joinApplyError.message}</p>;



  useEffect(() => {
    if (tenureJoinApplyData && userData) {
      setForm((prev) => ({
        ...prev,
        ...tenureJoinApplyData,
        emplNo: tenureJoinApplyData.emplNo || userData.loginUserId,
        loginCoId: tenureJoinApplyData.coCode || userData.loginCoId,

        // hndcapDate: tenureJoinApplyData.hndcapDate || "",
        // hndcapCode: tenureJoinApplyData.hndcapCode || "",
        // hndcapCodeKind: tenureJoinApplyData.hndcapCodeKind || "",
        // hndcapGradeCode: tenureJoinApplyData.hndcapGradeCode || "",
        // hndcapStateCode: tenureJoinApplyData.hndcapStateCode || "",
        // file: tenureJoinApplyData.file || "",
        // atchFileId: tenureJoinApplyData.atchFileId || "",
        // fileSn: tenureJoinApplyData.fileSn || "",
        // filePath: tenureJoinApplyData.filePath || "emp,mbl",
      }))
    }
  }, [tenureJoinApplyData, userData])



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
    }));
    setForm((prevForm: any) => ({
      ...prevForm,
      file: files,
      fileSeqNo: fileList[0].fileSeqNo,
      fileSn: fileList[0].fileSn,
      atchFileId: fileList[0].atchFileId,
      fileName: fileList[0].fileName,
      filePath: "emp,mbl"
      // atchFileId: fileList[0].atchFileId,
      // fileName: fileList[0].orignlFileNm,
      // fileName: fileList[0].orignlFileNm,
      // fileName: fileList[0].orignlFileNm,
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



  const handleSave = async () => {
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo320", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({ message: "저장이 완료되었습니다.", type: "success", open: true });
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchJoinApply();
        }, 1000);
      } else {
        setOpenToast({ message: "저장이 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
    }
  }



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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo320", formData);
      if (response.status === 200 && response.data) {
        const { data } = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/send", formData);
        if (data) {
          setOpenToast({ message: "제출이 완료되었습니다.", type: "success", open: true });
          setTimeout(async () => {
            setOpenToast((prev) => ({ ...prev, open: false }));
            setFieldDisable(true);
            setDisableSave(true);
            setDisableApply(true);
          }, 1000);
        } else {
          setOpenToast({ message: "제출에 실패하였습니다.", type: "danger", open: true });
        }
      } else {
        setOpenToast({ message: "제출에 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
    }
  }



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
  };


  
  return (
    <>
      <div className="pt-10 pb-10">
        <UIDatePicker
          label="장애인정일"
          // onDateSelect={(value) => setForm((prev) => ({ ...prev, hndcapDate: value }))}
          onDateSelect={(value) => handleSelectChange("hndcapDate", value)}
          placeholder={tenureJoinApplyData.hndcapDate}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="장애구분코드"
          items={disorderKind}
          // onQuerySelect={(value) => setForm((prev) => ({ ...prev, hndcapCode: value }))}
          onQuerySelect={(value) => handleSelectChange("hndcapCode", value)}
          defaultValue={tenureJoinApplyData.hndcapCode}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="장애유형코드"
          items={disorderType}
          // onQuerySelect={(value) => setForm((prev) => ({ ...prev, hndcapCodeKind: value }))}
          onQuerySelect={(value) => handleSelectChange("hndcapCodeKind", value)}
          defaultValue={tenureJoinApplyData.hndcapCodeKind}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="장애등급코드"
          items={disorderGrade}
          // onQuerySelect={(value) => setForm((prev) => ({ ...prev, hndcapGradeCode: value }))}
          onQuerySelect={(value) => handleSelectChange("hndcapGradeCode", value)}
          defaultValue={tenureJoinApplyData.hndcapGradeCode}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UISelect
          label="장애정도코드"
          items={disorderDegree}
          // onQuerySelect={(value) => setForm((prev) => ({ ...prev, hndcapStateCode: value }))}
          onQuerySelect={(value) => handleSelectChange("hndcapStateCode", value)}
          defaultValue={tenureJoinApplyData.hndcapStateCode}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-200">
        <input
          type="file"
          onChange={ async (e) => {
            const { data } = await axiosInstance.post("/files/upload-atchfile", e.target.files,
              { headers: { "Content-Type" : "multipart/form-data" } }
            );
            const fileList = Array.from(data).map((file:any, index:any) => ({
              fileSn: file.fileSn,
              atchFileId: file.atchFileId,
            }))
            setForm((prevForm: any) => ({
              ...prevForm,
              file: e.target.files,
              fileSn: fileList[0].fileSn,
              atchFileId: fileList[0].atchFileId,
            }));
          }}
          readOnly={fieldDisable}
        />
        <div className="pt-10 pb-10 fs-14 text-point-1">{form.fileName}</div>
      </div>
      {/* <div className="pt-10 pb-200">
        <div className="attach__file">
          <input
            type="file"
            ref={fileInputRef} // useRef로 파일 입력 요소 참조
            style={{ display: "none" }} // 화면에 보이지 않게 숨김
            onChange={handleFileChange}
            // multiple // multiple 속성 추가
          />
          <UIInput
            label="첨부파일"
            placeholder="증빙서류첨부"
            disabled
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
      </div> */}




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
          description="제출하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply();
            },
          }}
        >
          <UIButton type="primary" disabled={disableApply}>제출</UIButton>
        </UIAlert>
      </div>



      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}