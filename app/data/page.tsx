"use client";

import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComingSoonCard } from "@/components/ui/ComingSoonCard";

export default function DataPage() {
  return (
    <div className="min-h-screen pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="数据中心" 
          description="核心数据分析 [DATA CENTER]"
        />

        <ComingSoonCard 
          icon={faDatabase}
          title="模块暂未开放"
          subtitle="MODULE_LOCKED_V1.0"
          description="数据分析中心正在进行系统维护与升级。当前版本暂不支持访问详细数据报表。请等待后续系统更新或联系管理员获取临时访问权限。"
          delay={0.1}
        />
      </div>
    </div>
  );
}
