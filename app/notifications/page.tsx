"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ConstructionView } from "@/components/ui/ConstructionView";
import { faBell } from "@fortawesome/free-solid-svg-icons";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="通知中心 | NOTIFICATIONS" description="查看系统通知与消息 | View system notifications and messages" />
      
      <ConstructionView 
        icon={faBell}
        title="通知模块开发中"
        label="NOTIFICATIONS MODULE DEVELOPMENT"
        description="该页面将用于展示系统通知、任务更新及即时消息。消息推送服务正在配置中。"
      />
    </div>
  );
}
