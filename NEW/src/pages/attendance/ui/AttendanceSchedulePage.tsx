import { Schedule } from "@/features/attendance/checkAbout";
import { Header, Navigation } from "@/widgets/layouts";

export const AttendanceSchedulePage = () => {
	return (
		<>
			<Navigation />
			<Header navActive={false} title="My 월별 근무일정" />
			<section className="pt-52 pl-20 pr-20">
				<Schedule />
			</section>
		</>
	);
};