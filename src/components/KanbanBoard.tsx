import { useMemo, useState } from 'react'
import PlusIcon from '../icons/PlusIcon'
import { Column, Id, Task } from '../types';
import ColumnContainer from './ColumnContainer';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

const KanbanBoard = () => {
  
  const initialColumns = [
    { id: 0, title: "To Do" },
    { id: 1, title: "In Progress" },
    { id: 2, title: "In Review" },
    { id: 3, title: "Done" }
  ];
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );
  const columnsId = useMemo(() => columns.map(col => col.id), [columns]);

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId: columnId,
      content: `Task ${tasks?.length}`
    };

    setTasks([...tasks, newTask])
  };

  const deleteTask = (taskId: Id) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    setTasks(newTasks);
  };

  const createColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length}`
    };
    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter(col => col.id !== id);
    setColumns(filteredColumns);
  };

  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map(col => {
      if (col.id !== id) return col;
      return {...col, title}
    });
    setColumns(newColumns);
  };

  const updateTask = (id: Id, content: string) => {
    const newTasks = tasks.map(task => { 
      if (task.id !== id) {
        return task;
      }
      return { ...task, content };
    });
    setTasks(newTasks);
  };

  const generateId = () => {
    // generate a random number between 0 and 10000
    return Math.floor(Math.random() * 10001);
  };

  const onDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === "Column") {
      setActiveColumn(e.active.data.current.column);
      return;
    }

    if (e.active.data.current?.type === "Task") {
      setActiveTask(e.active.data.current.task);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setColumns(columns => {
      const activeColumnNdx = columns.findIndex((col) => col.id === activeId);
      const overColNdx = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnNdx, overColNdx);
    })
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // I'm dropping a task over another task
    if (isActiveATask && isOverATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId      

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // I'm dropping a task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      })
    }
  };
  
  return (
    <div className='
        m-auto 
        flex 
        min-h-screen 
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
      '>
        <DndContext 
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          sensors={sensors}
          onDragOver={onDragOver}>
          <div className='m-auto flex gap-4'>
            <div className='flex gap-4'>
              <SortableContext items={columnsId}>
                {
                  columns.map((column) => {
                  return (
                    <ColumnContainer 
                      key={column.id} 
                      deleteColumn={deleteColumn} 
                      updateColumn={updateColumn}
                      createTask={createTask}
                      deleteTask={deleteTask}
                      updateTask={updateTask}
                      column={column}
                      tasks={tasks.filter((task) => task.columnId === column.id)}>
                    </ColumnContainer>
                  )})
                }
              </SortableContext>
              
            </div>
            <button className="
              h-[60px] 
              w-[350px]
              min-w-[350px]
              cursor-pointer
              rounded-lg
              border-2
              p-4
              bg-gray-800
              hover:ring-2
              flex
              gap-2
            " onClick={createColumn}>
              <PlusIcon />
              Add Column
            </button>
          </div>
          { createPortal(<DragOverlay>
            {activeColumn && <ColumnContainer 
              column={activeColumn}
              deleteColumn={deleteColumn}
              updateColumn={updateColumn}
              createTask={createTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
              tasks={tasks.filter(
                task => task.columnId === activeColumn.id
              )} 
            />}
            {activeTask && <TaskCard 
              task={activeTask}
              deleteTask={deleteTask}
              updateTask={updateTask}></TaskCard>}
          </DragOverlay>, document.body)}
        </DndContext>
    </div>
  )
}

export default KanbanBoard
