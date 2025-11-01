import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Task } from '../types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  onTaskTextChange: (text: string) => void;
  onAddTask: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
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
  onTaskTextChange,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const generateWavyPath = (width: number) => {
    const amplitude = 1.5;
    const frequency = 0.08;
    const yCenter = 12;
    let path = `M 0 ${yCenter}`;
    for (let x = 0; x <= width; x += 2) {
      const y = yCenter + amplitude * Math.sin(frequency * x);
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  return (
    <View style={[styles.taskPanel, { backgroundColor: taskPanelBg }]}>
      <Text style={[styles.taskPanelTitle, { color: modeColor }]}>Tasks</Text>
      <ScrollView style={styles.taskList}>
        {tasks.map((task) => {
          const TaskItem = () => {
            const [textWidth, setTextWidth] = useState(0);
            const animatedOpacity = useRef(new Animated.Value(0)).current;

            useEffect(() => {
              if (task.completed) {
                Animated.timing(animatedOpacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              } else {
                animatedOpacity.setValue(0);
              }
            }, [task.completed]);

            return (
              <View style={styles.taskItem} key={task.id}>
                <TouchableOpacity
                  style={[styles.checkbox, { borderColor: modeColor }]}
                  onPress={() => onToggleTask(task.id)}
                >
                  {task.completed && (
                    <Text style={[styles.checkboxX, { color: modeColor }]}>✕</Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1, position: 'relative' }}>
                  <Text
                    onLayout={(e) => {
                      if (task.completed) {
                        setTextWidth(e.nativeEvent.layout.width);
                      }
                    }}
                    style={[
                      styles.taskText,
                      { color: textColor },
                      task.completed && styles.taskTextCompleted,
                    ]}
                  >
                    {task.text}
                  </Text>
                  {textWidth > 0 && task.completed && (
                    <Svg
                      height="100%"
                      width={textWidth}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                      }}
                      viewBox={`0 0 ${textWidth} 24`}
                    >
                      <AnimatedPath
                        d={generateWavyPath(textWidth)}
                        stroke={modeColor}
                        strokeWidth="1.5"
                        fill="none"
                        opacity={animatedOpacity}
                      />
                    </Svg>
                  )}
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
            );
          };

          return <TaskItem key={task.id} />;
        })}
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
    </View>
  );
};

const styles = StyleSheet.create({
  taskPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 80,
  },
  taskPanelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    borderBottomColor: '#E0E0E0',
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
    opacity: 0.5,
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
