import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import { MEAL_TYPES } from '../lib/constants';
import { errorMessage } from '../lib/format';
import { Button, Field, Input, Modal, Segmented } from './ui';

// Pick a day and meal slot for a recipe and add it to the meal plan.
const AddToPlanModal = ({ open, onClose, recipe }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mealType, setMealType] = useState('dinner');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/meal-plans', { recipe_id: recipe.id, planned_date: date, meal_type: mealType });
      toast.success(`Added to ${format(new Date(`${date}T00:00`), 'EEE d MMM')}`);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not add to meal plan'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to meal plan"
      description={recipe?.name}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-to-plan" loading={saving}>
            Add to plan
          </Button>
        </>
      }
    >
      <form id="add-to-plan" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Day">
          {(props) => <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} {...props} data-autofocus />}
        </Field>
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-ink-2">Meal</p>
          <Segmented value={mealType} onChange={setMealType} options={MEAL_TYPES} label="Meal" className="flex w-full" />
        </div>
        <p className="text-xs text-muted">If that slot already has a meal, it will be replaced.</p>
      </form>
    </Modal>
  );
};

export default AddToPlanModal;
