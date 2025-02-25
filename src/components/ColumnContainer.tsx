import { useMemo, useState } from 'react'
import { Column, Id, Task } from '../types'
import TrashIcon from '../icons/TrashIcon';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PlusIcon from '../icons/PlusIcon';
import TaskCard from './TaskCard';

interface Props {
  column: Column,
  tasks: Task[]
  deleteColumn: (id: Id) => void,
  updateColumn: (id: Id, title: string) => void,
  createTask: (columnId: Id) => void,
  deleteTask: (taskId: Id) => void,
  updateTask: (taskId: Id, content: string) => void,
}

const ColumnContainer = (props: Props) => {
  const { 
    column, 
    tasks,
    deleteColumn, 
    updateColumn, 
    createTask,
    deleteTask,
    updateTask,
  } = props;
  
  const [editMode, setEditMode] = useState<boolean>(false);

  const taskIds = useMemo(() => {
    return tasks.map(task => task.id);
  }, [tasks])

  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition, 
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    touchAction: 'none'
  };

  if (isDragging) {
    return <div ref={setNodeRef} 
      style={style}
      className='
        bg-gray-800 
        w-[350px] 
        h-[500px]
        max-h-[500px]
        rounded-md
        flex
        flex-col
        opacity-60
        border-2
        border-gray-900'
    ></div>
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className='
        bg-gray-800 
        w-[350px] 
        h-[500px]
        max-h-[500px]
        rounded-md
        flex
        flex-col'>
      {/* Column title */}
      <div 
        { ...attributes }
        { ...listeners }
        onClick={() => {
          setEditMode(true)
        }}
        className="
        bg-gray-900
        text-md
        h-[60px]
        cursor-grab
        rounded-md
        rounded-b-none
        p-3
        font-bold
        border-3
        border-gray-800
        flex
        items-center
        justify-between
      ">
        <div className='flex gap-2'>
          <div className='
            flex
            justify-center
            items-center
            px-2
            py-1
            text-sm
            rounded-full
          '>0</div>
          {!editMode && column.title}
          {editMode && <input 
            value={column.title} 
            onChange={(e) => updateColumn(column.id, e.target.value) }
            type='text' 
            onBlur={() => setEditMode(false) }
            onKeyDown={e => { 
              if (e.key !== 'Enter') return;
              setEditMode(false);
            }}  
            ></input>}
        </div>
        <button onClick={() => deleteColumn(column.id)} className='
          stroke-gray-500
          hover:stroke-white
          rounded
          px-1
          py-2
        '>
          <TrashIcon />
        </button>
      </div>
      
      {/* Column task container */}
      <div className='
        flex 
        flex-grow 
        flex-col 
        gap-4 
        p-2
        overflow-x-hidden
        overflow-y-auto'>
        <SortableContext items={taskIds}>
        {tasks.map((task) => {
          return (<>
            <TaskCard key={task.id} 
              task={task} 
              deleteTask={deleteTask}
              updateTask={updateTask}></TaskCard>
          </>)
        })}
        </SortableContext>
      </div>
      {/* Column footer */}
      <button className='
        flex gap-2 
        items-center 
        border-2 
        rounded-md
        p-4
        hover:bg-gray-900'
        onClick={() => {
          createTask(column.id)
        }}
      >
        <PlusIcon />Add Task
      </button>
    </div>
  )
}

export default ColumnContainer
