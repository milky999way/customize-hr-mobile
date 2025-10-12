import { axiosInstance } from "@/app/api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { TenureJoinApply, TenureJoinApplyList, TenureLeaveDetail, TenureLeaveFlow, TenureLeaveHandOver, TenureLeaveResignation, TenureLeaveSurvey } from "..";



// 퇴직Flow처리
const fetchTenureLeaveFlow = async (params: any): Promise<TenureLeaveFlow[]> => {
	const { data } = await axiosInstance.get(`/emp/dbhemprt/emprt140?fromDate=${params.fromDate}&toDate=${params.toDate}&rEmplNo=${params.rEmplNo}&rEmplNameHan=${params.rEmplNameHan}&sComplYn=${params.sComplYn}&role=${params.role}`);
	return data;
};
export const useTenureLeaveFlow = (params: any) => {
	return useQuery<TenureLeaveFlow[], Error>({
		queryKey: ['TenureLeaveFlow', params],
		queryFn: () => fetchTenureLeaveFlow(params),
		initialData: [],
		enabled: !!params.fromDate && !!params.rEmplNo && !!params.rEmplNameHan
	});
};

// 퇴직Flow처리
const fetchTenureLeaveDetail = async (params: any): Promise<TenureLeaveDetail[]> => {
	const { data } = await axiosInstance.get(`/emp/dbhemprt/emprt140/getdetail?${params}`);
	return data;
};
export const useTenureLeaveDetail = (params: any) => {
	return useQuery<TenureLeaveDetail[], Error>({
		queryKey: ['TenureLeaveDetail', params],
		queryFn: () => fetchTenureLeaveDetail(params),
		initialData: [],
		enabled: !!params
	});
};

// 퇴직Flow처리 - 퇴직설문
const fetchTenureLeaveSurvey = async (params: any): Promise<TenureLeaveSurvey[]> => {
	const { data } = await axiosInstance.get(`/emp/dbhemprt/emprt140/pop01?emplNo=${params.emplNo}&retireReqDate=${params.retireReqDate}&rtflowId=${params.rtflowId}`);
	return data;
};
export const useTenureLeaveSurvey = (params: any) => {
	return useQuery<TenureLeaveSurvey[], Error>({
		queryKey: ['TenureLeaveSurvey', params],
		queryFn: () => fetchTenureLeaveSurvey(params),
		initialData: [],
		enabled: !!params.emplNo && !!params.retireReqDate && !!params.rtflowId
	});
};

// 퇴직Flow처리 - 사직원
const fetchTenureLeaveResignation = async (params: any): Promise<TenureLeaveResignation[]> => {
	const { data } = await axiosInstance.get(`/emp/dbhemprt/emprt150?reqEmplNo=${params.reqEmplNo}&orgCode=${params.orgCode}&orgNameHan=${params.orgNameHan}&statusCode=${params.statusCode}`);
	return data;
};
export const useTenureLeaveResignation = (params: any) => {
	return useQuery<TenureLeaveResignation[], Error>({
		queryKey: ['TenureLeaveResignation', params],
		queryFn: () => fetchTenureLeaveResignation(params),
		initialData: [],
		enabled: !!params.reqEmplNo && !!params.orgCode && !!params.orgNameHan && !!params.statusCode
	});
};

// 퇴직Flow처리 - 인수인계서
const fetchTenureLeaveHandOver = async (params: any): Promise<TenureLeaveHandOver[]> => {
	const { data } = await axiosInstance.get(`/emp/dbhemprt/emprt170?reqEmplNo=${params.reqEmplNo}&orgCode=${params.orgCode}&orgNameHan=${params.orgNameHan}&statusCode=${params.statusCode}&reCd=`);
	return data;
};
export const useTenureLeaveHandOver = (params: any) => {
	return useQuery<TenureLeaveHandOver[], Error>({
		queryKey: ['TenureLeaveHandOver', params],
		queryFn: () => fetchTenureLeaveHandOver(params),
		initialData: [],
		enabled: !!params.reqEmplNo && !!params.orgCode && !!params.orgNameHan && !!params.statusCode
	});
};


// 입사정보
const fetchTenureJoinApply = async (params: any): Promise<TenureJoinApply> => {
	const { data } = await axiosInstance.get(`/emp/psmstinfombl/emppsmstinfo100/${params.apiName}?emplNo=${params.emplNo}&loginCoId=${params.loginCoId}`);
	return data;
};
export const useTenureJoinApply = (params: any) => {
	return useQuery<TenureJoinApply, Error>({
		queryKey: ['TenureJoinApply', params],
		queryFn: () => fetchTenureJoinApply(params),
		initialData: Object,
		// enabled: !!params.apiName && !!params.emplNo && !!params.loginCoId
		// cacheTime: 0,        // 🔥 캐시를 즉시 삭제
    staleTime: 0,        // 🔥 항상 데이터를 stale 상태로 유지
    refetchOnMount: true, // 🔥 마운트될 때마다 새로고침
    refetchOnWindowFocus: true, // 🔥 창 포커스 시 새로고침
    refetchIntervalInBackground: false, // 백그라운드에서 주기적으로 새로고침하지 않음
	});
};

// 입사정보
const fetchTenureJoinApplyList = async (params: any): Promise<TenureJoinApplyList[]> => {
	const { data } = await axiosInstance.get(`/emp/psmstinfombl/emppsmstinfo100/${params.apiName}?emplNo=${params.emplNo}&loginCoId=${params.loginCoId}`);
	return data;
};
export const useTenureJoinApplyList = (params: any) => {
	return useQuery<TenureJoinApplyList[], Error>({
		queryKey: ['TenureJoinApplyList', params],
		queryFn: () => fetchTenureJoinApplyList(params),
		initialData: [],
		// enabled: !!params.apiName && !!params.emplNo && !!params.loginCoId
		// cacheTime: 0,        // 🔥 캐시를 즉시 삭제
    staleTime: 0,        // 🔥 항상 데이터를 stale 상태로 유지
    refetchOnMount: true, // 🔥 마운트될 때마다 새로고침
    refetchOnWindowFocus: true, // 🔥 창 포커스 시 새로고침
    refetchIntervalInBackground: false, // 백그라운드에서 주기적으로 새로고침하지 않음
	});
};
