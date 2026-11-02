"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useState} from "react";
import {BookOpen,CalendarDays,ChartNoAxesColumn,Compass,LayoutDashboard,LogOut,ShieldCheck,Wallet,Settings,HeartHandshake,Users,Menu,X,FileText,GraduationCap,ClipboardCheck} from "lucide-react";
import {Brand} from "@/components/brand";
import {useAuth} from "@/components/providers";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import type {ReactNode} from "react";

const learnerNav=[
 {href:"/dashboard",label:"Overview",icon:LayoutDashboard},
 {href:"/discover",label:"Find a tutor",icon:Compass},
 {href:"/requests",label:"Requests",icon:Users},
 {href:"/lessons",label:"Lessons",icon:CalendarDays},
 {href:"/progress",label:"Learning progress",icon:ChartNoAxesColumn},
 {href:"/payments",label:"Payments",icon:Wallet},
];
const tutorNav=[
 {href:"/dashboard",label:"Overview",icon:LayoutDashboard},
 {href:"/tutor/manage",label:"My teaching profile",icon:GraduationCap},
 {href:"/tutor/onboarding",label:"Verification",icon:ShieldCheck},
 {href:"/requests",label:"Requests",icon:Users},
 {href:"/lessons",label:"Lessons",icon:CalendarDays},
 {href:"/progress",label:"Progress reports",icon:ChartNoAxesColumn},
 {href:"/earnings",label:"Earnings & payouts",icon:Wallet},
];
const adminNav=[{href:"/dashboard",label:"Overview",icon:LayoutDashboard},{href:"/admin",label:"Review centre",icon:ClipboardCheck},{href:"/safeguarding",label:"Safety & reports",icon:HeartHandshake}];
export function AppShell({children,title,description}:{children:ReactNode;title:string;description?:string}){
 const {user,loading,signOut}=useAuth();const router=useRouter();const path=usePathname();const [mobileOpen,setMobileOpen]=useState(false);
 useEffect(()=>{if(!loading&&!user)router.replace("/login?next="+encodeURIComponent(path));},[loading,user,router,path]);
 if(loading||!user)return <div className="grid min-h-screen place-items-center bg-[#f7f9fc]"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#1769d2]/20 border-t-[#1769d2]"/></div>;
 const items=user.role==="ADMIN"?adminNav:user.role==="TUTOR"?tutorNav:learnerNav;
 const signOutNow=async()=>{try{await signOut();router.replace("/");}catch(e){toast.error(e instanceof Error?e.message:"Could not log out");}};
 return <div className="min-h-screen bg-[#f7f9fc]">
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-[#e7ebf2] bg-white lg:flex">
   <div className="flex h-[76px] items-center border-b border-[#edf0f5] px-6"><Brand/></div>
   <div className="flex-1 overflow-y-auto px-3 py-6"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a3b4]">Workspace</p><nav className="space-y-1">{items.map(item=>{const active=path===item.href||(item.href!=="/dashboard"&&path.startsWith(item.href+"/"));return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${active?"bg-[#edf4ff] text-[#1769d2]":"text-[#66758a] hover:bg-[#f7f9fc] hover:text-[#102a56]"}`}><item.icon size={17} strokeWidth={active?2.3:1.8}/>{item.label}</Link>})}</nav>
    <div className="my-6 border-t border-[#edf0f5]"/><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#98a3b4]">Account</p><nav className="space-y-1"><Link href="/settings" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${path==="/settings"?"bg-[#edf4ff] text-[#1769d2]":"text-[#66758a] hover:bg-[#f7f9fc]"}`}><Settings size={17}/>Settings</Link><Link href="/safeguarding" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${path==="/safeguarding"?"bg-[#edf4ff] text-[#1769d2]":"text-[#66758a] hover:bg-[#f7f9fc]"}`}><HeartHandshake size={17}/>Help & safety</Link></nav></div>
   <div className="border-t border-[#edf0f5] p-4"><div className="flex items-center gap-3 rounded-xl p-2"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e9f2ff] text-sm font-bold text-[#1769d2]">{user.display_name.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#102a56]">{user.display_name}</p><p className="mt-0.5 text-[10px] capitalize text-[#8a96a8]">{user.role.toLowerCase().replace("_"," ")}</p></div><button aria-label="Sign out" onClick={signOutNow} className="rounded-lg p-2 text-[#8290a4] hover:bg-[#f1f4f8] hover:text-[#102a56]"><LogOut size={16}/></button></div></div>
  </aside>
  <div className="lg:pl-[236px]">
   <header className="sticky top-0 z-20 border-b border-[#e7ebf2] bg-white/95 backdrop-blur"><div className="flex h-[68px] items-center justify-between px-4 sm:px-7"><div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={()=>setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-[#52647c] hover:bg-[#f1f4f8] lg:hidden">{mobileOpen?<X size={20}/>:<Menu size={20}/>}</button><div className="lg:hidden"><Brand/></div><div className="hidden lg:block"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#98a3b4]">Your workspace</p><p className="mt-0.5 text-sm font-semibold text-[#243a5a]">{title}</p></div></div><Link href="/settings" className="flex items-center gap-2 rounded-full border border-[#e7ebf2] bg-white py-1.5 pl-1.5 pr-3 hover:bg-[#f7f9fc]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9f2ff] text-xs font-bold text-[#1769d2]">{user.display_name.slice(0,1).toUpperCase()}</span><span className="hidden max-w-[150px] truncate text-xs font-semibold text-[#52647c] sm:inline">{user.display_name}</span></Link></div>
   {mobileOpen&&<nav className="border-t border-[#edf0f5] bg-white p-3 lg:hidden">{items.map(item=><Link onClick={()=>setMobileOpen(false)} key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${path===item.href?"bg-[#edf4ff] text-[#1769d2]":"text-[#66758a]"}`}><item.icon size={17}/>{item.label}</Link>)}<div className="my-2 border-t border-[#edf0f5]"/><Link onClick={()=>setMobileOpen(false)} href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[#66758a]"><Settings size={17}/>Settings</Link><button onClick={signOutNow} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[#66758a]"><LogOut size={17}/>Sign out</button></nav>}
   </header>
   <main className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 sm:py-9 xl:px-10"><div className="mb-7"><h1 className="page-heading">{title}</h1>{description&&<p className="mt-2 max-w-2xl text-sm leading-6 text-[#758298]">{description}</p>}</div>{children}</main>
  </div>
 </div>
}
