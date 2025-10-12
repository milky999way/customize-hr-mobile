import { axiosInstance } from "@/app/api/axiosInstance";
import { useDateStore } from "@/app/store/authStore";
import { useSalaryHealthIns } from "@/entities/salary";
import { useUser } from "@/entities/user";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton, UISelect, UIToast } from "@/shared/ui";
import { useState } from "react";


export const HealthIns = () => {
  const [openToast, setOpenToast] = useState({ message: "", type: "", open: false });
  const [form, setForm] = useState({
    miadjDbList: [{
      rowStatus: "U",
    }]
  });

  // 조회일(today)
  const {currentDate, setCurrentDate} = useDateStore();
  const toYear = currentDate.toLocaleDateString('sv-SE', { year: 'numeric' });
  const [year, setYear] = useState<string>(toYear);
  
  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  if (isUserLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  const { data: salaryHealthInsData, isLoading: isSalaryHealthInsLoading, error: salaryHealthInsError, refetch: refetchSalaryHealthIns } = useSalaryHealthIns({
    yyyy: year,
    orgCode: userData.loginDeptId,
    orgNameHan: userData.loginDeptName,
    emplNo: userData.loginUserId,
    emplNameHan: userData.loginUserNm,
  });
	if (isSalaryHealthInsLoading) return <p>Loading...</p>;
	if (salaryHealthInsError) return <p>Error: {salaryHealthInsError.message}</p>;

  const getYearRange = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => ({
      label: `${start + i}`,
      error: false,
      query: `${start + i}`,
    }));
  };

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
      const response = await axiosInstance.post("/pay/dbhpayinsu/payin560_db/save", formData);
      if (response.status === 200 && response.data) {
        setOpenToast({ message: "저장이 완료되었습니다.", type: "success", open: true });
        setTimeout(async () => {
          setOpenToast((prev) => ({ ...prev, open: false }));
          await refetchSalaryHealthIns();
        }, 1000);
      } else {
        setOpenToast({ message: "저장이 실패하였습니다.", type: "danger", open: true });
      }
    } catch (error: any) {
      setOpenToast({ message: error.response?.data?.message || "오류가 발생하였습니다.", type: "danger", open: true });
    }
  };


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
        <UISelect label="조회 연도" items={getYearRange(2010, 2025).reverse()} onQuerySelect={(yy) => setYear(yy)} />
      </div>
      <div className="pt-10 pb-10">
        <div className="count__control">
          <div className="count">총 <em>{salaryHealthInsData.length}</em> 건</div>
        </div>
        <ul className="list">
          {salaryHealthInsData.length === 0 ?
            <li className="fs-15 text-center">데이터가 없습니다.</li>
          : salaryHealthInsData.map((item: any, i) => 
            <li key={i}>
              <div className="list__content">
                <div className="top">
                  <div className="date">정산년도: {item.yyyy}</div>
                </div>
                <div className="info">
                  <div>
                    <strong>총급여액</strong>
                    <span>{formatByType("number", item.totPayAmt)}</span>
                  </div>
                  <div>
                    <strong>확정보험료</strong>
                    <span>{formatByType("number", item.confmInsurAmt)}</span>
                  </div>
                  <div>
                    <strong>납부보험료</strong>
                    <span>{formatByType("number", item.dedInsurAmt)}</span>
                  </div>
                  <div>
                    <strong>추징환급금액</strong>
                    <span>{formatByType("number", item.repayAmt)}</span>
                  </div>
                  <div>
                    <strong>분납 대상여부</strong>
                    <span>{item.devdInd}</span>
                  </div>
                  <div>
                    <strong>마감여부</strong>
                    <span>{item.closeInd}</span>
                  </div>
                  <div>
                    <strong className="align-items-center">납부개월수</strong>
                    <span>
                      <UISelect
                        defaultValue={item.devdCd}
                        items={[
                          {label: "일시납부", error: false, query: "01" },
                          {label: "2개월 분납", error: false, query: "02" },
                          {label: "3개월 분납", error: false, query: "03" },
                          {label: "4개월 분납", error: false, query: "04" },
                          {label: "5개월 분납", error: false, query: "05" },
                          {label: "6개월 분납", error: false, query: "06" },
                          {label: "7개월 분납", error: false, query: "07" },
                          {label: "8개월 분납", error: false, query: "08" },
                          {label: "9개월 분납", error: false, query: "09" },
                          {label: "10개월 분납", error: false, query: "10" },
                        ]}
                        onQuerySelect={(value) => {
                          handleSelectChange(`miadjDbList[${i}].devdCd`, value)
                          handleSelectChange(`miadjDbList[${i}].rowKey`, item.chk)

                          handleSelectChange(`miadjDbList[${i}].yyyy`, item.yyyy)
                          handleSelectChange(`miadjDbList[${i}].emplNo`, item.emplNo)
                          handleSelectChange(`miadjDbList[${i}].emplNameHan`, item.emplNameHan)
                          handleSelectChange(`miadjDbList[${i}].orgNameHan`, item.orgNameHan)
                          handleSelectChange(`miadjDbList[${i}].gradeNameHan`, item.gradeNameHan)
                          handleSelectChange(`miadjDbList[${i}].confmInsurAmt`, item.confmInsurAmt)
                          handleSelectChange(`miadjDbList[${i}].dedInsurAmt`, item.dedInsurAmt)
                          handleSelectChange(`miadjDbList[${i}].repayAmt`, item.repayAmt)
                          handleSelectChange(`miadjDbList[${i}].devdInd`, item.devdInd)
                          handleSelectChange(`miadjDbList[${i}].closeInd`, item.closeInd)
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>



      <div className="applyAction">   
        <UIAlert
          description="저장하시겠습니까?"
          actionProps={{
            onClick: () => {
              handleApply();                
            },
          }}
        >
          <UIButton type="primary">저장</UIButton>
        </UIAlert>
      </div>
      {openToast.open && (
        <UIToast message={openToast.message} type={openToast.type} open={openToast.open} onOpenChange={setOpenToast} />
      )}
    </>
  )
}