import { usePersonnelInfo } from "@/entities/personnel";
import { useUser } from "@/entities/user";
import { formatByType } from "@/shared/lib/formatByType";
import { UIAlert, UIButton } from "@/shared/ui";


export const EContract = () => {

  const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
	if (isUserLoading) return <p>Loading...</p>;
	if (userError) return <p>Error: {userError.message}</p>;

  const { data: personnelInfoData, isLoading: isPersonnelInfoLoading, error: personnelInfoError } = usePersonnelInfo({ emplNo: userData.loginUserId });
	if (isPersonnelInfoLoading) return <p>Loading...</p>;
	if (personnelInfoError) return <p>Something went wrong!</p>;
  console.log(personnelInfoData);





  const handleViewer = (data: any) => {
    // 설정값 유지
    console.log(data)
    const staticFormData = {
      formName: "mobileContract",
      sysRptId: "mobileContract",
      projectName: "dbh^contract",
      UB_UNVISIBLE_MENULIST: "saveWord,savePPT,saveCSV,saveHWP,saveHtml,btnSaveDataLB",

      // 개발배포
      rptProfile: "dev",
      imgUrl: "http://10.141.5.197:8110/",

      // 운영배포
      // rptProfile: "prod",
      // imgUrl: "https://hrmreport.dbhitek.com/",
    };

    // 데이터 병합
    const printFormData = {
      ...staticFormData,
      ...data, // 받은 데이터를 그대로 병합
    };


    console.log(printFormData);

    // Create a form dynamically
    const printForm = document.createElement("form");
    printForm.setAttribute("method", "POST");

    // 개발배포
    printForm.setAttribute("action", "http://10.141.5.197:8120/UView5/index.jsp");

    // 운영배포
    // printForm.setAttribute("action", "https://hrmreport.dbhitek.com/UView5/index.jsp");

    printForm.setAttribute("target", "_blank"); // Open in a new tab or window

    // Append hidden inputs for each form data field
    for (const [key, value] of Object.entries(printFormData)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value != null ? String(value) : "";
      printForm.appendChild(input);
    }

    // Append the form to the document, submit, and remove it
    document.body.appendChild(printForm);
    // console.log(printForm);
    printForm.submit();
    document.body.removeChild(printForm);
  };




  const handleApply = async () => {
  }




  return (
    <>
      <div className="pt-10 pb-10">
        <ul className="list">
          <li>
            <div className="list__content">
              <div className="top">
                <div className="date">전자계약서</div>
                <div className="d-flex justify-content-between">
                  <UIAlert
                    description="제출하시겠습니까?"
                    actionProps={{
                      onClick: () => {
                        handleApply();
                      },
                    }}
                  >
                    <UIButton type="secondary" size="small" className="mr-10">제출</UIButton>
                  </UIAlert>
                  <UIButton type="border" size="small" onClick={() => handleViewer({emplNo: personnelInfoData.emplNo, resNo: personnelInfoData.resNo})}>보기</UIButton>
                </div>
              </div>
              
              <div className="info">
                <div>
                  <strong>입사자</strong>
                  <span>{personnelInfoData.emplNameHan}</span>
                </div>
                <div>
                  <strong>입사일</strong>
                  <span>{personnelInfoData.entranceDate}</span>
                </div>
                <div>
                  <strong>사번</strong>
                  <span>{personnelInfoData.emplNo}</span>
                </div>
              </div>

            </div>
          </li>
        </ul>
      </div>
    </>
  )
}