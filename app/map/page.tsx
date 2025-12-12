"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ConstructionView } from "@/components/ui/ConstructionView";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";

export default function MapPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="世界地图 | WORLD MAP" description="探索游戏世界与地点 | Explore the game world and locations" />
      
      <ConstructionView 
        icon={faMapLocationDot}
        title="地图模块开发中"
        label="MAP MODULE DEVELOPMENT"
        description="该页面将包含交互式地图、地标标记及快速旅行点设置。地形数据正在渲染中。"
      />
    </div>
  );
}
