import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useTenureJoinApplyList } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIDatePicker, UIInput, UISelect, UIToast } from "@/shared/ui"
import { useEffect, useRef, useState } from "react";



export const InfoApply07 = () => {
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [form, setForm] = useState({
    emplNo: "",
    loginCoId: "",
    psmstrMblList: [{
      coCode: "",
      emplNo: "",
      langCode: "",
      testDate: "",
      langTestCode: "",
      totalPoint: "",
      enforceAgency: "",
      file: "",
      atchFileId: "",
      fileSn: "",
      fileName: "",
      filePath: "emp,mbl",
    }],
  });


  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyListData, isLoading: isJoinApplyListLoading, error: joinApplyListError, refetch: refetchJoinApplyList } = useTenureJoinApplyList({
    apiName: "emppsmstinfo190",
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId
  });
  if (isJoinApplyListLoading) return <p>Loading...</p>;
  if (joinApplyListError) return <p>Error: {joinApplyListError.message}</p>;
  // console.log(tenureJoinApplyListData);




  useEffect(() => {
    if (tenureJoinApplyListData && userData) {
      setForm((prev: any) => ({
        ...prev,
        emplNo: userData.loginUserId,
        loginCoId: userData.loginCoId,
        psmstrMblList: tenureJoinApplyListData.map((item: any, index: number) => ({
          ...item,
          emplNo: prev.psmstrMblList?.[index]?.emplNo || userData.loginUserId,
          coCode: prev.psmstrMblList?.[index]?.coCode || userData.loginCoId,
        })),
      }));
    }
  }, [tenureJoinApplyListData, userData]);

  
  // 외국어 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "LE01", "effDateYn": true, "companyYn": true },
      { "patternCode": "LE02", "effDateYn": true, "companyYn": true },
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
  const languageType = codeData[0]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  const languageTestType = codeData[1]?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})




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
    const formData = new FormData();
    const appendFormData = (data: any, parentKey = '') => {
      if (data instanceof File) {
        // 단일 파일 객체 처리
        formData.append(parentKey, data);
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        // 객체 처리
        Object.entries(data).forEach(([key, value]) => {
          appendFormData(value, parentKey ? `${parentKey}.${key}` : key);
        });
      } else if (Array.isArray(data)) {
        // 배열 처리
        data.forEach((item, index) => {
          if (item instanceof File) {
            // 배열에서 파일 처리 시 배열 인덱스 제거
            formData.append(parentKey, item);
          } else {
            appendFormData(item, `${parentKey}[${index}]`);
          }
        });
      } else {
        // 기본 데이터 처리
        formData.append(parentKey, data);
      }
    };
    appendFormData(form);

    try {
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo190", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({ message: "저장이 완료되었습니다.", type: "success", open: true });
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchJoinApplyList();
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo190", formData);
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



  const handleAdd = () => {
    setForm((prevForm: any) => ({
      ...prevForm,
      psmstrMblList: [
        ...prevForm.psmstrMblList,
        {
          coCode: userData.loginCoId,
          emplNo: userData.loginUserId,
          langCode: "",
          testDate: "",
          langTestCode: "",
          totalPoint: "",
          enforceAgency: "",
          file: "",
          atchFileId: "",
          fileSn: "",
          filePath: "",
        }
      ],
    }));
  };


  
  return (
    <>
      {form.psmstrMblList.map((family, index) => (
        <div key={index} className="pb-30 mb-30" style={{borderBottom: "0.1rem dashed #07ae55"}}>
          <div className="pt-10 pb-10">
            <UISelect
              label="외국어구분코드"
              items={languageType}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, langCode: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.langCode}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIDatePicker
              label="테스트일자"
              // onDateSelect={(value) => setForm((prev) => ({ ...prev, testDate: value }))}
              onDateSelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, testDate: value } : item
                  ),
                }))
              }
              placeholder={tenureJoinApplyListData[index]?.testDate}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UISelect
              label="테스트구분코드"
              items={languageTestType}
              // onQuerySelect={(value) => setForm((prev) => ({ ...prev, langTestCode: value }))}
              // onQuerySelect={(value) => handleSelectChange(`psmstrMblList[${index}].langTestCode`, value)}
              // defaultValue={form.pvCodeKind}
              onQuerySelect={(value) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, langTestCode: value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.langTestCode}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="점수/등급"
              // onChange={(e) => setForm((prev) => ({ ...prev, totalPoint: e.target.value }))}
              // onChange={(e) => handleSelectChange(`psmstrMblList[${index}].totalPoint`, e.target.value)}
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, totalPoint: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.totalPoint}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="시행기관"
              // onChange={(e) => setForm((prev) => ({ ...prev, enforceAgency: e.target.value }))}
              // onChange={(e) => handleSelectChange(`psmstrMblList[${index}].enforceAgency`, e.target.value)}
              onChange={(e) => 
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item, i) =>
                    i === index ? { ...item, enforceAgency: e.target.value } : item
                  ),
                }))
              }
              defaultValue={tenureJoinApplyListData[index]?.enforceAgency}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <input
              type="file"
              onChange={ async (e: React.ChangeEvent<HTMLInputElement>) => {
                const { data } = await axiosInstance.post("/files/upload-atchfile", e.target.files,
                  { headers: { "Content-Type" : "multipart/form-data" } }
                );
                const fileList = Array.from(data).map((file:any, index:any) => ({
                  fileSn: file.fileSn,
                  atchFileId: file.atchFileId,
                }))
                setForm((prev) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i) =>
                    i === index ? {
                      ...item,
                      file: e.target.files,
                      fileSn: fileList[0].fileSn,
                      atchFileId: fileList[0].atchFileId,
                    }: item
                  ),
                }))
              }}
              readOnly={fieldDisable}
            />
            <div className="pt-10 pb-10 fs-14 text-point-1">{form.psmstrMblList[index].fileName}</div>
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
        </div>
      ))}


      <div className="pt-10 pb-200">
        <UIButton type="border" onClick={handleAdd}>외국어추가 +</UIButton>
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