import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Task } from '../types';

interface TaskPanelProps {
  tasks: Task[];
  newTaskText: string;
  modeColor: string;
  textColor: string;
  modeTextColor: string;
  taskPanelBg: string;
  inputBg: string;
  inputBorder: string;
  secondaryButtonText: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  onTaskTextChange: (text: string) => void;
  onAddTask: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onClose: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  newTaskText,
  modeColor,
  textColor,
  modeTextColor,
  taskPanelBg,
  inputBg,
  inputBorder,
  secondaryButtonText,
  secondaryButtonBg,
  secondaryButtonBorder,
  onTaskTextChange,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  onClose,
}) => {
  const hasCompletedTasks = tasks.some(task => task.completed);
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;
  const isDesktopWeb = Platform.OS === 'web' && width >= 768;
  const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <View style={styles.container}>
      {/* Backdrop overlay for desktop web only - clicking it closes the panel */}
      {isDesktopWeb && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Task Panel */}
      <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : onClose}>
        <View style={[
          styles.taskPanel,
          { backgroundColor: taskPanelBg },
          (isMobileWeb || isNativeMobile) && { left: 0, width: '100%' },
          isDesktopWeb && { width: '50%' },
        ]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.header}>
        <Text style={[styles.taskPanelTitle, { color: modeColor }]}>Tasks</Text>
        {hasCompletedTasks && (
          <TouchableOpacity
            style={[styles.clearButton, {
              backgroundColor: secondaryButtonBg,
              borderColor: secondaryButtonBorder,
            }]}
            onPress={onClearCompleted}
          >
            <Text style={[styles.clearButtonText, { color: secondaryButtonText }]}>Clear</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.taskList} keyboardShouldPersistTaps="handled">
        {tasks.map((task) => (
          <View style={styles.taskItem} key={task.id}>
                <TouchableOpacity
                  style={[styles.checkbox, { borderColor: modeColor }]}
                  onPress={() => onToggleTask(task.id)}
                >
                  {task.completed && (
                    <Text style={[styles.checkboxX, { color: modeColor }]}>✕</Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskText,
                      { color: textColor },
                      task.completed && [styles.taskTextCompleted, { color: modeColor }],
                    ]}
                  >
                    {task.text}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteTask(task.id)}
                >
                  <Text style={[styles.deleteButtonText, { color: secondaryButtonText }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
        ))}
      </ScrollView>

      <View style={[styles.taskInputContainer, { borderColor: inputBorder }]}>
        <TextInput
          style={[
            styles.taskInput,
            {
              backgroundColor: inputBg,
              color: textColor,
              borderColor: inputBorder,
            },
          ]}
          placeholder="Add a task..."
          placeholderTextColor={modeTextColor}
          value={newTaskText}
          onChangeText={onTaskTextChange}
          onSubmitEditing={onAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: modeColor }]}
          onPress={onAddTask}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  taskPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  taskPanelMobileWeb: {
    // Full width on mobile web
    left: 0,
    right: 0,
    width: '100%',
  },
  taskPanelDesktopWeb: {
    // Half width on desktop web
    left: undefined,
    right: 0,
    width: '50%',
  },
  keyboardAvoidingView: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 80,
    minHeight: 0, // Prevents layout issues when keyboard opens
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  taskPanelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  clearButton: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  taskList: {
    flex: 1,
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxX: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  taskTextCompleted: {
    opacity: 0.7,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  taskInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
