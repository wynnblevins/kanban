import { useState } from 'react'
import { Id, Task } from '../types'
import TrashIcon from '../icons/TrashIcon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  task: Task,
  deleteTask: (taskId: Id) => void;
  updateTask: (taskId: Id, content: string) => void;
}

const TaskCard = (props: Props) => {
  const { task, deleteTask, updateTask } = props;
  
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition, 
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    touchAction: 'none'
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  }

  if (isDragging) {
    return <div ref={setNodeRef} className="
      bg-gray-900
      p-2.5
      h-[100px]
      min-h-[100px]
      items-center
      flex
      text-left
      rounded-xl
      hover:ring-2
      hover:ring-inset
      relative
      opacity-50" 
      style={style}></div>
  }

  if (editMode) return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='
        bg-gray-900
        p-2.5
        h-[100px]
        min-h-[100px]
        items-center
        flex
        text-left
        rounded-xl
        hover:ring-2
        hover:ring-inset
        relative
      '>
      <textarea className='
        h-[90%]
        w-full
        resize-none 
        border-none
        rounded
        bg-transparent
        text-white
        focus:outline-none
      ' 
      value={task.content}
      autoFocus
      placeholder='Task content here'
      onBlur={toggleEditMode}
      onKeyDown={e => {
        if (e.key === "Enter" && e.shiftKey) {
          toggleEditMode();
        }
      }}
      onChange={(e) => {
        updateTask(task.id, e.target.value);
      }}></textarea>
    </div>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setMouseIsOver(true)} 
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={() => {
        toggleEditMode()
      }} 
      className='
        bg-gray-900
        p-2.5
        h-[100px]
        min-h-[100px]
        items-center
        flex
        text-left
        rounded-xl
        hover:ring-2
        hover:ring-inset
        relative
      '>
      <p className="
        my-auto 
        h-[90%] 
        w-full 
        overflow-y-auto
        overflow-x-hidden
        whitespace-pre-wrap"
        style={style}>{task.content}</p>
      { mouseIsOver && <button onClick={() => deleteTask(task.id)} className='
        stroke-white 
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        p-2
        rounded
        opacity-60
        hover:opacity-100'>
        <TrashIcon></TrashIcon>
      </button>}
    </div>
  )
}

export default TaskCard
