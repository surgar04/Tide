"use client";

import { faBell } from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComingSoonCard } from "@/components/ui/ComingSoonCard";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="通知中心" 
          description="查看系统通知与消息 [NOTIFICATIONS]" 
        />
        
        <ComingSoonCard 
          icon={faBell}
          title="无信号"
          subtitle="NO_SIGNAL_DETECTED"
          description="当前没有任何系统通知或消息。您的通讯频道目前处于静默状态。如有紧急事务，请通过其他加密频道联系管理员。"
          statusText="SILENT // 静默模式"
          delay={0.1}
        />
      </div>
    </div>
  );
}
