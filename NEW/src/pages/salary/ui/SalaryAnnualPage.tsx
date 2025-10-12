import { Annual } from "@/features/salary/checkAbout"
import { Header, Navigation } from "@/widgets/layouts"

export const SalaryAnnualPage = () => {
  return (
    <>
      <Navigation />
      <Header navActive={false} title="연봉계약서" />
      <section className="pt-52 pl-20 pr-20">
        <Annual />
			</section>
    </>
  )
}