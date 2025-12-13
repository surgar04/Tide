"use client";

import { faCloud } from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComingSoonCard } from "@/components/ui/ComingSoonCard";

export default function CloudPage() {
  return (
    <div className="min-h-screen pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="云控中心" 
          description="分布式计算与资源调度 [CLOUD CONTROL]"
        />

        <ComingSoonCard 
          icon={faCloud}
          title="连接中断"
          subtitle="CONNECTION_LOST_ERR_503"
          description="无法连接到云端控制节点。该区域可能处于信号屏蔽区或服务器正在进行例行维护。请检查网络连接状态或稍后重试。"
          statusText="OFFLINE // 离线状态"
          delay={0.1}
        />
      </div>
    </div>
  );
}
