import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "./ui/button"
import { FileDiff, LayoutDashboard, Youtube } from "lucide-react"

export function SideBar() {
  return (
    <Sidebar className="bg-zinc-800">
      <SidebarHeader>
        <h1 className="text-xl font-semibold tracking-tight text-white">Study Assistant</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-2">
          <Link href={'/'}>
            <div className="flex hover:bg-zinc-800 px-3 rounded-lg py-2 transition-all duration-200 items-center tracking-tight font-medium gap-2 text-md text-white">
              <span><FileDiff  strokeWidth={1.9}/></span>
              
              Dashboard
            </div>            
          </Link>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}