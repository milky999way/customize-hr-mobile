import { UITabs } from "@/shared/ui";
import { InfoApply01 } from "./form/InfoApply01";
import { InfoApply02 } from "./form/InfoApply02";
import { InfoApply03 } from "./form/InfoApply03";
import { InfoApply04 } from "./form/InfoApply04";
import { InfoApply05 } from "./form/InfoApply05";
import { InfoApply06 } from "./form/InfoApply06";
import { InfoApply07 } from "./form/InfoApply07";
import { InfoApply08 } from "./form/InfoApply08";
import { InfoApply09 } from "./form/InfoApply09";
import { useState } from "react";


export const InfoApply = () => {
  const [apiName, setApiName] = useState("");
  const [isSaved, setIsSaved] = useState([
    {tab: 1, saved: false},
    {tab: 2, saved: false},
    {tab: 3, saved: false},
    {tab: 4, saved: false},
    {tab: 5, saved: false},
    {tab: 6, saved: false},
    {tab: 7, saved: false},
    {tab: 8, saved: false},
    {tab: 9, saved: false},
  ])

  // const { data: userData, isLoading: isUserLoading, error: userError } = useUser();
  // if (isUserLoading) return <p>Loading...</p>;
  // if (userError) return <p>Error: {userError.message}</p>;

  // const { data: tenureJoinApplyData, isLoading: isJoinApplyLoading, error: joinApplyError } = useTenureJoinApply({
  //   apiName: apiName,
  //   emplNo: userData.loginUserId,
  //   loginCoId: userData.loginCoId
  // });
  // if (isJoinApplyLoading) return <p>Loading...</p>;
  // if (joinApplyError) return <p>Error: {joinApplyError.message}</p>;


  // const memoizedData = useMemo(() => ({ ...tenureJoinApplyData }), [tenureJoinApplyData]);
  // console.log(memoizedData);

  
  const tabsData = [
    { value: "emppsmstinfo120", label: "신상", content: <InfoApply01 /> },
    { value: "emppsmstinfo130", label: "병역", content: <InfoApply02 /> },
    { value: "emppsmstinfo140", label: "가족", content: <InfoApply03 /> },
    { value: "emppsmstinfo150", label: "학력", content: <InfoApply04 /> },
    { value: "emppsmstinfo160", label: "경력", content: <InfoApply05 /> },
    { value: "emppsmstinfo180", label: "자격", content: <InfoApply06 /> },
    { value: "emppsmstinfo190", label: "외국어", content: <InfoApply07 /> },
    { value: "emppsmstinfo310", label: "보훈", content: <InfoApply08 /> },
    { value: "emppsmstinfo320", label: "장애", content: <InfoApply09 /> },
  ];


  

  return (
    <>
      <div className="pt-10 pb-10">
        <UITabs tabsData={tabsData} onTabbed={(value) => setApiName(value)} />
      </div>

      
      {/* <div className="applyAction">
        <UIAlert
          description="저장하시겠습니까?"
          actionProps={{
            onClick: () => {
              // handleSave();
            },
          }}
        >
          <UIButton type="border">저장</UIButton>
        </UIAlert>
        <UIAlert
          description="제출하시겠습니까?"
          actionProps={{
            onClick: () => {
              // handleSave();
            },
          }}
        >
          <UIButton type="primary" disabled>제출</UIButton>
        </UIAlert>
      </div> */}
      
    </>
  )
}