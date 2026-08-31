import {describe,expect,it} from 'vitest';
import {holyFlameChapter} from './chapterHolyFlame';
import {ironRoadChapter} from './chapterIronRoad';
import {veiledDawnChapter} from './chapterVeiledDawn';
import type {StoryChapter,StoryNode} from './types';

const chapters=[holyFlameChapter,ironRoadChapter,veiledDawnChapter];
function exits(node:StoryNode):string[]{
  if(node.kind==='dialogue')return node.choices.map(choice=>choice.next);
  if(node.kind==='battle')return [node.victoryNext,node.defeatNext];
  return [];
}
function reachable(chapter:StoryChapter,from:string,seen=new Set<string>()):Set<string>{
  if(seen.has(from))return seen;seen.add(from);
  for(const target of exits(chapter.nodes[from]))reachable(chapter,target,seen);
  return seen;
}
function canReachEnding(chapter:StoryChapter,from:string,seen=new Set<string>()):boolean{
  if(seen.has(from))return false;seen.add(from);
  const node=chapter.nodes[from];
  return node.kind==='ending'||exits(node).some(target=>canReachEnding(chapter,target,seen));
}

describe('season story flow',()=>{
  it.each(chapters)('%s has no dangling story branch and every reachable node can finish',(chapter)=>{
    expect(chapter.nodes[chapter.startNodeId]).toBeDefined();
    for(const node of Object.values(chapter.nodes)){
      for(const target of exits(node))expect(chapter.nodes[target],`${chapter.id}:${node.id} -> ${target}`).toBeDefined();
    }
    const visited=reachable(chapter,chapter.startNodeId);
    expect([...visited].some(id=>chapter.nodes[id].kind==='ending')).toBe(true);
    for(const id of visited)expect(canReachEnding(chapter,id),`${chapter.id}:${id} cannot reach an ending`).toBe(true);
  });
  it('gives every formal battle both a victory and defeat route to a chapter ending',()=>{
    for(const chapter of chapters)for(const node of Object.values(chapter.nodes))if(node.kind==='battle'){
      expect(canReachEnding(chapter,node.victoryNext),`${chapter.id}:${node.id}:victory`).toBe(true);
      expect(canReachEnding(chapter,node.defeatNext),`${chapter.id}:${node.id}:defeat`).toBe(true);
    }
  });
});
