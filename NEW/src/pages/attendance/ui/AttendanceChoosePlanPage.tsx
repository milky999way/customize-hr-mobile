import { ChoosePlan } from "@/features/attendance/applyTo";
import { Header, Navigation } from "@/widgets/layouts";

export const AttendanceChoosePlanPage = () => {
	return (
		<>
			<Navigation />
			<Header navActive={false} title="월간 선택근로 신청" />
			<section className="pt-52 pl-20 pr-20">
        <ChoosePlan />
			</section>
		</>
	);
};