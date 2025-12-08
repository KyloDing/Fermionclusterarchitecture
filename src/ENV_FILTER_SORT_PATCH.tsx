// 这个文件展示需要添加到 TrainingTaskCreatePage.tsx 的筛选排序功能代码

// ========================================
// 1. 在组件顶部添加 useMemo 导入（已完成）
// ========================================
// import { useState, useEffect, useMemo } from 'react';

// ========================================
// 2. 添加筛选排序逻辑（在 runningEnvs 之后添加）
// ========================================

// 应用筛选和排序的环境列表
const filteredAndSortedEnvs = useMemo(() => {
  let result = [...runningEnvs];
  
  // 1. 搜索过滤
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(env => 
      env.name.toLowerCase().includes(query) ||
      env.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // 2. GPU类型筛选
  if (filterGpuType.length > 0) {
    result = result.filter(env => filterGpuType.includes(env.gpuType));
  }
  
  // 3. 可用区筛选
  if (filterZone.length > 0) {
    result = result.filter(env => filterZone.includes(env.availabilityZone));
  }
  
  // 4. 环境类型筛选
  if (filterType.length > 0) {
    result = result.filter(env => filterType.includes(env.type));
  }
  
  // 5. 排序
  if (sortBy !== 'none') {
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'gpuCount':
          return b.gpuCount - a.gpuCount; // 降序
        case 'uptime':
          // 简单的时长比较（实际应该解析uptime字符串）
          const parseUptime = (uptime?: string) => {
            if (!uptime) return 0;
            if (uptime.includes('天')) {
              const days = parseInt(uptime);
              return days * 24;
            }
            if (uptime.includes('小时')) {
              return parseInt(uptime);
            }
            return 0;
          };
          return parseUptime(b.uptime) - parseUptime(a.uptime); // 降序
        default:
          return 0;
      }
    });
  }
  
  return result;
}, [runningEnvs, searchQuery, filterGpuType, filterZone, filterType, sortBy]);

// 计算活跃的筛选数量
const activeFiltersCount = useMemo(() => {
  let count = 0;
  if (searchQuery.trim()) count++;
  if (filterGpuType.length > 0) count++;
  if (filterZone.length > 0) count++;
  if (filterType.length > 0) count++;
  return count;
}, [searchQuery, filterGpuType, filterZone, filterType]);

// 清除所有筛选
const clearAllFilters = () => {
  setSearchQuery('');
  setFilterGpuType([]);
  setFilterZone([]);
  setFilterType([]);
  setSortBy('none');
};

// 获取唯一的可用区列表
const uniqueZones = useMemo(() => {
  return Array.from(new Set(runningEnvs.map(env => env.availabilityZone)));
}, [runningEnvs]);

// ========================================
// 3. 替换环境列表部分的JSX
// ========================================

{/* 使用现有环境 - 环境列表 */}
{launchMode === 'existing' && runningEnvs.length > 0 && (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Label>选择开发环境</Label>
      <span className="text-sm text-slate-500">
        {filteredAndSortedEnvs.length} / {runningEnvs.length} 个环境
      </span>
    </div>

    {/* 筛选和排序控制栏 */}
    <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="搜索环境名称或标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 筛选和排序按钮行 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* GPU类型筛选 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-3 h-3 mr-2" />
              GPU类型
              {filterGpuType.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filterGpuType.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>选择GPU类型</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['A100', 'V100', 'T4', 'RTX3090'].map((gpu) => (
              <DropdownMenuCheckboxItem
                key={gpu}
                checked={filterGpuType.includes(gpu)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilterGpuType([...filterGpuType, gpu]);
                  } else {
                    setFilterGpuType(filterGpuType.filter(g => g !== gpu));
                  }
                }}
              >
                {gpu}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 可用区筛选 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-3 h-3 mr-2" />
              可用区
              {filterZone.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filterZone.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>选择可用区</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniqueZones.map((zone) => (
              <DropdownMenuCheckboxItem
                key={zone}
                checked={filterZone.includes(zone)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilterZone([...filterZone, zone]);
                  } else {
                    setFilterZone(filterZone.filter(z => z !== zone));
                  }
                }}
              >
                {zone}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 环境类型筛选 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-3 h-3 mr-2" />
              类型
              {filterType.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filterType.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>选择环境类型</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filterType.includes('notebook')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilterType([...filterType, 'notebook']);
                } else {
                  setFilterType(filterType.filter(t => t !== 'notebook'));
                }
              }}
            >
              Jupyter Notebook
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterType.includes('custom')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilterType([...filterType, 'custom']);
                } else {
                  setFilterType(filterType.filter(t => t !== 'custom'));
                }
              }}
            >
              自定义环境
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 排序 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <SortAsc className="w-3 h-3 mr-2" />
              排序
              {sortBy !== 'none' && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>排序方式</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <DropdownMenuRadioItem value="none">
                默认排序
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">
                按名称排序
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="gpuCount">
                按GPU数量（多→少）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="uptime">
                按运行时长（长→短）
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 清除筛选 */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-slate-600"
            onClick={clearAllFilters}
          >
            <X className="w-3 h-3 mr-2" />
            清除筛选 ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* 活跃的筛选标签 */}
      {(filterGpuType.length > 0 || filterZone.length > 0 || filterType.length > 0 || sortBy !== 'none') && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200">
          {filterGpuType.map((gpu) => (
            <Badge key={gpu} variant="secondary" className="gap-1">
              GPU: {gpu}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => setFilterGpuType(filterGpuType.filter(g => g !== gpu))}
              />
            </Badge>
          ))}
          {filterZone.map((zone) => (
            <Badge key={zone} variant="secondary" className="gap-1">
              {zone}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => setFilterZone(filterZone.filter(z => z !== zone))}
              />
            </Badge>
          ))}
          {filterType.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type === 'notebook' ? 'Jupyter' : '自定义'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => setFilterType(filterType.filter(t => t !== type))}
              />
            </Badge>
          ))}
          {sortBy !== 'none' && (
            <Badge variant="secondary" className="gap-1">
              排序: {sortBy === 'name' ? '名称' : sortBy === 'gpuCount' ? 'GPU数量' : '运行时长'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => setSortBy('none')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>

    {/* 环境列表 - 注意这里使用 filteredAndSortedEnvs 而不是 runningEnvs */}
    {filteredAndSortedEnvs.length > 0 ? (
      <RadioGroup value={selectedEnvId} onValueChange={setSelectedEnvId}>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {filteredAndSortedEnvs.map((env) => (
            <div
              key={env.id}
              className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                selectedEnvId === env.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedEnvId(env.id)}
            >
              <RadioGroupItem value={env.id} id={`env-${env.id}`} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor={`env-${env.id}`} className="cursor-pointer font-medium">
                    {env.name}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {env.type === 'notebook' ? 'Jupyter' : '自定义'}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    运行中
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>📍 {env.availabilityZone}</div>
                  <div>💾 {env.image.split(':')[0].split('/').pop()}</div>
                  <div>🎮 {env.gpuCount}x {env.gpuType}</div>
                  <div>⏱️ {env.uptime}</div>
                </div>
                {env.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {env.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    ) : (
      <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
        <Filter className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="font-medium">没有找到匹配的环境</p>
        <p className="text-sm mt-1">请尝试调整筛选条件</p>
        <Button
          variant="link"
          size="sm"
          className="mt-2"
          onClick={clearAllFilters}
        >
          清除所有筛选
        </Button>
      </div>
    )}
  </div>
)}
