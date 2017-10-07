package net.gregorkofler.java8.lambda;

import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

public class MyLambdaStreamTutorial {

    public static void main(String[] args) {

        List<String> list = Arrays.asList("1","2","3","4","5","6");
        Function<String, Integer> convertToInt = s -> Integer.valueOf(s);
        Function<Integer, Integer> add = i -> i+1;
        Consumer<Object> print = o -> {
            System.out.println(o.getClass().getName() +" " +o);
        };
        System.out.println("----------------------------------------");
        list.stream().forEach(System.out::println);
        System.out.println("----------------------------------------");
        list.stream().forEach(print);
        System.out.println("----------------------------------------");
        list.stream().map(convertToInt).forEach(print);
        System.out.println("----------------------------------------");
        list.stream().map(convertToInt).map(add).forEach(print);
        System.out.println("----------------------------------------");
        list.stream().map(s -> Integer.valueOf(s)).map(i -> i+1).forEach( o -> {
            System.out.println(o.getClass().getName() +" " +o);
        });
        System.out.println("----------------------------------------");
        list.parallelStream().map(s -> Integer.valueOf(s)).map(i -> i+1).forEach( o -> {
            System.out.println(o.getClass().getName() +" " +o);
        });

        System.out.println("-------------Filter------------------");
        System.out.println("----------------------------------------");
        list.stream().map(s -> Integer.valueOf(s)).map(i -> i+1).filter(i -> i % 2 == 0).forEach( o -> {
            System.out.println(o.getClass().getName() +" " +o);
        });
        System.out.println("----------------------------------------");
        list.stream().map(s -> Integer.valueOf(s)).map(i -> i+1).filter(i -> i % 2 == 0).forEach(System.out::println);
        Integer n = list.stream().map(s -> Integer.valueOf(s)).map(i -> i+1).filter(i -> i % 2 == 0).reduce(0,(x,y) -> x+y);
        System.out.println("sum:" +n);
        System.out.println("----------------------------------------");
        String[] txt = { "State", "of", "the", "Lambda", "Libraries", "Edition"};
        int sum = Arrays.stream(txt)
                .filter(s -> s.length() > 3)
                . peek (System.out::println)
                .map(String::length)
                . peek (System.out::println)
                .reduce(0, Integer::sum);

        System.out.println("----------------------------------------");

        Map<String, String> map = new HashMap();
        map.put("1","Coole");
        map.put("2","Sau");

        List<NameValuePair> nameValuePairList = map.entrySet().stream().map(e -> new NameValuePair(e.getKey(),e.getValue())).collect(Collectors.toList());

        nameValuePairList.forEach(System.out::println);
    }


    public static class NameValuePair{
        private String key;
        private String value;

        public NameValuePair(String key, String value){
            this.key=key;
            this.value=value;
        }

        public String toString(){
            return key+"|"+value;
        }
    }
}
