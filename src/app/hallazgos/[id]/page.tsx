import { FindingDetail } from '@/features/findings';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <FindingDetail id={id}/>;}
