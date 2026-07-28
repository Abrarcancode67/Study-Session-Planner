import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, GripVertical, Trash2, Play, AlertCircle } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

import { useStudyStore } from '@/context/StudyContext';
import { Priority, PlannedSprint } from '@/types';
import { PageTransition } from '@/components/PageTransition';

function SortableSprintItem({ sprint, index }: { sprint: PlannedSprint, index: number }) {
  const { subjects, removePlannedSprint } = useStudyStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: sprint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subject = subjects.find(s => s.id === sprint.subjectId);
  const priorityColor = 
    sprint.priority === 'High' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
    sprint.priority === 'Medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group flex items-center gap-4 p-4 rounded-xl border ${isDragging ? 'bg-card border-primary z-10 shadow-2xl opacity-80' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab p-1 text-muted-foreground hover:text-white active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/10 text-white/80">
            {subject?.name || 'Unknown'}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColor}`}>
            {sprint.priority}
          </span>
        </div>
        <p className="text-base font-medium text-white truncate">{sprint.topic}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-xl font-mono font-bold text-white">{sprint.durationMinutes}</span>
          <span className="text-xs text-muted-foreground ml-1">min</span>
        </div>
        
        <button 
          onClick={() => removePlannedSprint(sprint.id)}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Delete sprint"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function Planner() {
  const [, setLocation] = useLocation();
  const { subjects, plannedSprints, addSubject, addPlannedSprint, reorderPlannedSprints, startTimer } = useStudyStore();
  
  const [subjectId, setSubjectId] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<number | ''>(25);
  const [priority, setPriority] = useState<Priority>('Medium');

  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = plannedSprints.findIndex(s => s.id === active.id);
      const newIndex = plannedSprints.findIndex(s => s.id === over.id);
      const newOrder = arrayMove(plannedSprints, oldIndex, newIndex);
      reorderPlannedSprints(newOrder.map(s => s.id));
    }
  };

  const handleAddSprint = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalSubjectId = subjectId;

    if (isAddingSubject) {
      if (!newSubjectName.trim()) {
        setError('Subject name is required');
        return;
      }
      const newSubject = addSubject(newSubjectName.trim());
      finalSubjectId = newSubject.id;
      setSubjectId(newSubject.id);
      setIsAddingSubject(false);
      setNewSubjectName('');
    } else if (!finalSubjectId) {
      setError('Please select or create a subject');
      return;
    }

    if (!topic.trim()) {
      setError('Topic is required');
      return;
    }

    const durNum = Number(duration);
    if (!durNum || isNaN(durNum) || durNum < 1 || durNum > 180) {
      setError('Duration must be between 1 and 180 minutes');
      return;
    }

    addPlannedSprint({
      subjectId: finalSubjectId,
      topic: topic.trim(),
      durationMinutes: durNum,
      priority
    });

    setTopic('');
  };

  const handleStartQueue = () => {
    if (plannedSprints.length > 0) {
      startTimer(plannedSprints[0].id);
      setLocation('/focus');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Sprint Planner</h1>
            <p className="text-muted-foreground mt-1">Queue up your focus sessions for the day.</p>
          </div>
          
          <button
            onClick={handleStartQueue}
            disabled={plannedSprints.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(0,204,255,0.4)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed hover:bg-primary/90 transition-all active:scale-95"
            data-testid="btn-start-queue"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Add Sprint Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Add Sprint</h2>
              
              <form onSubmit={handleAddSprint} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  {!isAddingSubject ? (
                    <select 
                      value={subjectId} 
                      onChange={e => {
                        if (e.target.value === 'new') {
                          setIsAddingSubject(true);
                        } else {
                          setSubjectId(e.target.value);
                        }
                      }}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="" disabled>Select subject...</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                      <option value="new">+ Add new subject...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Subject name"
                        value={newSubjectName}
                        onChange={e => setNewSubjectName(e.target.value)}
                        className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={() => { setIsAddingSubject(false); setNewSubjectName(''); }}
                        className="px-3 py-2 text-muted-foreground hover:text-white bg-white/5 rounded-lg border border-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Topic / Goal</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Read Chapter 4"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Minutes</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="180"
                      value={duration}
                      onChange={e => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <select 
                      value={priority} 
                      onChange={e => setPriority(e.target.value as Priority)}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Queue
                </button>
              </form>
            </div>
          </div>

          {/* Queue List */}
          <div className="lg:col-span-8">
            <div className="glass-panel p-6 rounded-2xl min-h-[500px] flex flex-col">
              <h2 className="text-lg font-bold text-white mb-4">Sprint Queue</h2>
              
              {plannedSprints.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Queue is empty</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Add sprints using the form. Drag and drop to reorder them based on what you want to tackle first.
                  </p>
                </div>
              ) : (
                <div className="flex-1">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={plannedSprints} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {plannedSprints.map((sprint, idx) => (
                            <SortableSprintItem key={sprint.id} sprint={sprint} index={idx} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
