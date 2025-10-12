import { axiosInstance } from "@/app/api/axiosInstance";
import { useTenureJoinApply } from "@/entities/tenure";
import { useUser } from "@/entities/user";
import { UIAlert, UIButton, UIIconButton, UIInput, UIRadio, UIToast } from "@/shared/ui";
import { useEffect, useRef, useState } from "react";



export const InfoApply01 = () => {
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [disableSave, setDisableSave] = useState(false);
  const [disableApply, setDisableApply] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  
  const [form, setForm] = useState({
    emplNo: "",
    loginCoId: "",

    coCode: "",
    emplNameHan: "",
    emplNameFirst: "",
    emplNameLast: "",
    emplNameChn: "",
    emplNameEng: "",
    emplNameEngFirst: "",
    emplNameEngLast: "",
    sexCode: "",
    outEmail: "",
    resiplaceZip: "",
    resiplaceAddr: "",
    atchFileId1: "",
    fileSn1: "",
    fileName1: "",
    atchFIleId2: "",
    fileSn2: "",
    fileName2: "",
    atchFileId3: "",
    fileSn3: "",
    fileName3: "",
  });



  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: tenureJoinApplyData, isLoading: isJoinApplyLoading, error: joinApplyError, refetch: refetchJoinApply } = useTenureJoinApply({
    apiName: "emppsmstinfo120",
    emplNo: userData.loginUserId,
    loginCoId: userData.loginCoId
  });
  if (isJoinApplyLoading) return <p>Loading...</p>;
  if (joinApplyError) return <p>Error: {joinApplyError.message}</p>;



  useEffect(() => {
    if (tenureJoinApplyData) {
      setForm((prev) => ({
        ...prev,
        ...tenureJoinApplyData,
        emplNo: tenureJoinApplyData.emplNo || userData.loginUserId,
        loginCoId: tenureJoinApplyData.coCode || userData.loginCoId,

        // coCode: tenureJoinApplyData.coCode || "",
        // emplNameHan: tenureJoinApplyData.emplNameHan || "",
        // emplNameFirst: tenureJoinApplyData.emplNameFirst || "",
        // emplNameLast: tenureJoinApplyData.emplNameLast || "",
        // emplNameChn: tenureJoinApplyData.emplNameChn || "",
        // emplNameEng: tenureJoinApplyData.emplNameEng || "",
        // emplNameEngFirst: tenureJoinApplyData.emplNameEngFirst || "",
        // emplNameEngLast: tenureJoinApplyData.emplNameEngLast || "",
        // sexCode: tenureJoinApplyData.sexCode || "",
        // outEmail: tenureJoinApplyData.outEmail || "",
        // resiplaceZip: tenureJoinApplyData.resiplaceZip || "",
        // resiplaceAddr: tenureJoinApplyData.resiplaceAddr || "",
        // atchFileId1: tenureJoinApplyData.atchFileId1 || "",
        // fileSn1: tenureJoinApplyData.fileSn1 || "",
        // fileName1: tenureJoinApplyData.fileName1 || "",
        // atchFIleId2: tenureJoinApplyData.atchFIleId2 || "",
        // fileSn2: tenureJoinApplyData.fileSn2 || "",
        // fileName2: tenureJoinApplyData.fileName2 || "",
        // atchFileId3: tenureJoinApplyData.atchFileId3 || "",
        // fileSn3: tenureJoinApplyData.fileSn3 || "",
        // fileName3: tenureJoinApplyData.fileName3 || "",
      }))
    }
  }, [tenureJoinApplyData])





  // const fileFields = [
  //   { key: 'file1', label: '증명사진', placeholder: '증명사진 첨부' },
  //   { key: 'file2', label: '사원증용사진', placeholder: '사원증용사진 첨부' },
  //   { key: 'file3', label: '주민등록등본', placeholder: '주민등록등본 첨부' },
  // ];

  // const [selectedFiles, setSelectedFiles] = useState<any>({ file1: null, file2: null, file3: null });
  // const fileInputRefs = useRef<any>({ file1: null, file2: null, file3: null });

  // const handleFileChange = (e: any, key: any) => {
  //   const file = e.target.files[0];
  //   setSelectedFiles((prev: any) => ({ ...prev, [key]: file }));
  // };
 
  // const handleFileClick = (key: any) => {
  //   fileInputRefs.current[key]?.click();
  // };
 
  // const handleFileRemove = (key: any) => {
  //   setSelectedFiles((prev: any) => ({ ...prev, [key]: null }));
  // };





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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo120", formData);
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
      const response = await axiosInstance.post("/emp/psmstinfombl/emppsmstinfo100/emppsmstinfo120", formData);
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
      <div className="pt-10 pb-10 d-flex gap-10">
        <div className="d-flex" style={{width: "60%"}}>
          <UIInput
            label="성명 - 이름"
            onChange={(e) => handleSelectChange("emplNameFirst", e.target.value )}
            value={form?.emplNameFirst}
            readOnly={fieldDisable}
          />
        </div>
        <div className="d-flex" style={{width: "40%"}}>
          <UIInput
            label="성명 - 성"
            onChange={(e) => handleSelectChange("emplNameLast", e.target.value )}
            value={form.emplNameLast}
            readOnly={fieldDisable}
          />
        </div>
      </div>
      <div className="pt-10 pb-10 d-flex gap-10">
        <div className="d-flex" style={{width: "60%"}}>
          <UIInput
            label="성명(영어) - 이름"
            onChange={(e) => handleSelectChange("emplNameEngFirst", e.target.value )}
            value={form.emplNameEngFirst}
            readOnly={fieldDisable}
            />
        </div>
        <div className="d-flex" style={{width: "40%"}}>
          <UIInput
            label="성명(영어) - 성"
            onChange={(e) => handleSelectChange("emplNameEngLast", e.target.value )}
            value={form.emplNameEngLast}
            readOnly={fieldDisable}
          />
        </div>
      </div>
      <div className="pt-10 pb-10">
        <UIInput
          label="성명(한자)"
          onChange={(e) => handleSelectChange("emplNameChn", e.target.value )}
          value={form.emplNameChn}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIRadio
          items={[
            {label: "남자", value: "1"},
            {label: "여자", value: "2"},
          ]}
          onItemSelect={(value) => handleSelectChange("sexCode", value )}
          defaultValue={tenureJoinApplyData.sexCode}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIInput
          label="우편번호"
          onChange={(e) => handleSelectChange("resiplaceZip", e.target.value )}
          value={form.resiplaceZip}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIInput
          label="주소"
          onChange={(e) => handleSelectChange("resiplaceAddr", e.target.value )}
          value={form.resiplaceAddr}
          readOnly={fieldDisable}
        />
      </div>
      <div className="pt-10 pb-10">
        <UIInput
          label="개인메일"
          onChange={(e) => handleSelectChange("outEmail", e.target.value )}
          value={form.outEmail}
          readOnly={fieldDisable}
        />
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
              file2: e.target.files,
              fileSn2: fileList[0].fileSn,
              atchFileId2: fileList[0].atchFileId,
            }));
          }}
          readOnly={fieldDisable}
        />
        <div className="pt-10 pb-10 fs-14 text-point-1">{form.fileName2}</div>
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
              file3: e.target.files,
              fileSn3: fileList[0].fileSn,
              atchFileId3: fileList[0].atchFileId,
            }));
          }}
          readOnly={fieldDisable}
        />
        <div className="pt-10 pb-10 fs-14 text-point-1">{form.fileName3}</div>
      </div>




      {/* {fileFields.map(({ key, label, placeholder }, index) => (
        <div key={index} className={index+1 === fileFields.length ? "pt-10 pb-200" : "pt-10 pb-10"}>
          <div className="attach__file">
            <input
              type="file"
              ref={(el) => (fileInputRefs.current[key] = el)}
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, key)}
            />
            <UIInput
              label={label}
              placeholder={placeholder}
              // value={selectedFiles[key]?.name || ''}
              readOnly
            />
            <UIIconButton onClick={() => handleFileClick(key)} className="is-file has-pressed-action" />
          </div>
          <div>
            {selectedFiles[key] && (
              <ul className="attach__file__list">
                <li>
                  <UIInput value={selectedFiles[key].name} readOnly />
                  <div className="icon is-delete mt-10 ml-10 mr-10" onClick={() => handleFileRemove(key)}></div>
                </li>
              </ul>
            )}
          </div>
        </div>
      ))} */}


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