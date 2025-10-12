import { axiosInstance } from "@/app/api/axiosInstance";
import { useBaseCode } from "@/entities/approvalLine";
import { useTenureJoinApply } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UICheckbox, UIIconButton, UIInput, UISelect, UIToast } from "@/shared/ui"
import { useEffect, useRef, useState } from "react";



export const InfoApply03 = () => {
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [form, setForm] = useState({
    emplNo: "",
    loginCoId: "",

    file1: "",
    fileName1: "",
    atchFileId1: "",
    fileSn1: "",
    file2: "",
    atchFIleId2: "",
    fileName2: "",
    fileSn2: "",
    filePath: "emp,mbl",
    psfmlyList: [],
    psmstrMblList: [],
    // psfmlyList: [{
    //   coCode: "",
    //   emplNo: "",
    //   resNoFamily: "",
    //   familyNameHan: "",
    //   relCode: "",
    //   taxdedAmtInd: "",
    //   etcContent: "",
    // }],
    // psmstrMblList: [{
    //   coCode: "",
    //   emplNo: "",
    //   resNoFamily: "",
    //   familyNameHan: "",
    //   relCode: "",
    //   taxdedAmtInd: "",
    //   etcContent: "",
    // }]
  });



  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyData, isLoading: isJoinApplyLoading, error: joinApplyError, refetch: refetchJoinApply } = useTenureJoinApply({
    apiName: "emppsmstinfo140",
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId
  });
  if (isJoinApplyLoading) return <p>Loading...</p>;
  if (joinApplyError) return <p>Error: {joinApplyError.message}</p>;

  

  useEffect(() => {
    if (tenureJoinApplyData) {
      setForm((prev: any) => ({
        ...prev,
        emplNo: tenureJoinApplyData.emplNo || userData.loginUserId,
        loginCoId: tenureJoinApplyData.coCode || userData.loginCoId,
        psmstrMblList: tenureJoinApplyData.psfmlyList || [],
      }))
    }
  }, [tenureJoinApplyData])


  
  // 가족관계 코드 쿼리
  const parameters = {
    baseCodList: [
      { "patternCode": "PS22", "effDateYn": true, "companyYn": true },
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
  const relCodeData = codeData[0];
  const relCodeDataTarget = relCodeData?.map((codeItem: any) => { return {label: codeItem.codeName, error: false, query: codeItem.codeKey}})
  
  
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files); // 상태 업데이트
      setForm((prevForm: any) => ({
        ...prevForm,
        files: Array.from(files)
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




  const [addField, setAddField] = useState();
  // 가족 추가 버튼 핸들러
  const handleAdd = () => {
    setForm((prevForm: any) => ({
      ...prevForm,
      psmstrMblList: [
        ...prevForm.psmstrMblList,
        {
          coCode: userData.loginCoId,
          emplNo: userData.loginUserId,
          resNoFamily: "",
          familyNameHan: "",
          relCode: "",
          taxdedAmtInd: "",
          etcContent: "",
        },
      ],
    }));
  };



  // console.log(form);
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo140", formData);
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo140", formData);
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
      {form.psmstrMblList.length > 0 && form.psmstrMblList.map((family: any, index) => (
        <div key={index} className="pb-30 mb-30" style={{borderBottom: "0.1rem dashed #07ae55"}}>
          <div className="pt-10 pb-10">
            <UISelect
              label="관계코드"
              items={relCodeDataTarget}
              onQuerySelect={(value) => 
                setForm((prev: any) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i: number) =>
                    i === index ? { ...item, relCode: value } : item
                  ),
                }))
              }
              defaultValue={family.relCode}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="가족주민번호"
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i: number) =>
                    i === index ? { ...item, resNoFamily: e.target.value } : item
                  ),
                }))
              }
              defaultValue={family.resNoFamily}
              readOnly={fieldDisable}
            />
          </div>
          <div className="pt-10 pb-10">
            <UIInput
              label="이름"
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i: number) =>
                    i === index ? { ...item, familyNameHan: e.target.value } : item
                  ),
                }))
              }
              defaultValue={family.familyNameHan}
              readOnly={fieldDisable}
            />
          </div>

          <div className="pt-10 pb-10">
            <UICheckbox
              label="부양여부(Y/N)"
              onChange={(value) =>
                setForm((prev: any) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i: number) =>
                    i === index ? { ...item, taxdedAmtInd: value ? "Y" : "N" } : item
                  ),
                }))
              }
              disabled={fieldDisable}
              // value={tenureJoinApplyData.psfmlyList[index]?.taxdedAmtInd}
            />
          </div>

          <div className="pt-10 pb-10">
            <UIInput
              label="비고"
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  psmstrMblList: prev.psmstrMblList.map((item: any, i: number) =>
                    i === index ? { ...item, etcContent: e.target.value } : item
                  ),
                }))
              }
              defaultValue={family.etcContent}
              readOnly={fieldDisable}
            />
          </div>
        </div>
      ))}

      <div className="pt-10 pb-50">
        <UIButton type="border" onClick={handleAdd}>가족추가 +</UIButton>
      </div>



      <div className="pt-10 pb-10">
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
              file1: e.target.files,
              fileSn1: fileList[0].fileSn,
              atchFileId1: fileList[0].atchFileId,
              filePath: "emp,mbl"
            }));
          }}
          readOnly={fieldDisable}
        />
        <div className="pt-10 pb-10 fs-14 text-point-1">{form.fileName1}</div>
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
              file2: e.target.files,
              fileSn2: fileList[0].fileSn,
              atchFileId2: fileList[0].atchFileId,
            }));
          }}
          readOnly={fieldDisable}
        />
        <div className="pt-10 pb-10 fs-14 text-point-1">{form.fileName2}</div>
      </div>



      {/* <div className="pt-10 pb-200">
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
          />
          <UIIconButton onClick={handleFileClick} className="is-file has-pressed-action" />
        </div>
        <p className="fs-14 text-point-1 pt-10">* 주민등록등본(피부양자신청) / 가족관계증명서</p>
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